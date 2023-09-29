import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from 'src/bookmark/application/bookmark.pagination';
import { IBookmarkRepository } from 'src/bookmark/domain/repository/ibookmark.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BookmarkEntity } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { Bookmarks_TagsEntity } from 'src/bookmark/infra/db/entity/bookmarks_tags.entity';
import { BookmarkFactory } from 'src/bookmark/domain/bookmark.factory';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { Tag } from 'src/tag/domain/tag';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { BookmarkTagMap } from 'src/bookmark/domain/bookmark.interface';
import { UtilsService } from 'src/utils/utils.service';

//북마크가 가져야 하는게 태그 엔티티인지 태그 도메인 객체인지 불명확. 이거 확실히 해야함
@Injectable()
export class BookmarkRepository implements IBookmarkRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    @Inject('BookmarkRepository')
    private bookmarkRepository: Repository<BookmarkEntity>,
    @InjectRepository(TagEntity)
    @Inject('TagRepository')
    private tagRepository: Repository<TagEntity>,
    private bookmarkFactory: BookmarkFactory,
    private tagFactory: TagFactory,
    private utilsService: UtilsService,
  ) {}
  get: (id: string) => Promise<Bookmark | null>;

  async delete(id: string) {
    const deleteBookmark = await this.bookmarkRepository.delete(id);
    return deleteBookmark;
  }

  createEntity(userId: string, url: string): BookmarkEntity {
    return this.bookmarkRepository.create({
      id: this.utilsService.getUuid(),
      url: url,
      userId: userId,
    });
  }

  async save(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    const { url, userId, tags } = bookmark;
    const bookmarkEntity = this.createEntity(userId, url);
    await this.bookmarkRepository.save(bookmarkEntity);
    return this.bookmarkFactory.reconstitute(
      bookmarkEntity.id,
      bookmarkEntity.url,
      bookmarkEntity.userId,
      tags || [],
    );
  }

  async update(id: string, item: Bookmark): Promise<any> {
    const bookmark = item;
    // const tags = bookmark.getTags().map((tag) => {
    //   return this.tagFactory.create(tagEntity.id, tagEntity.tag);
    // });
    // const bookmarkEntity = this.bookmarkRepository.create({id:bookmark.getId(),url:bookmark.getUrl(), userId:bookmark.getUserId(), tags:bookmark.getTags()})
    //엔티티와 도메인 모양이 다르다. 어떻게 해야 할까?
    return await this.bookmarkRepository.update(id, { url: bookmark.url });
  }

  async getAll(): Promise<Bookmark[]> {
    const bookmarkEntities = await this.bookmarkRepository.find({
      relations: ['tags'],
    });
    if (bookmarkEntities.length <= 0) {
      return [];
    }
    return bookmarkEntities.map((entity) => {
      const tags = entity.tags.map((tag) => {
        return this.tagFactory.reconstitute(tag.id, tag.tag);
      });
      return this.bookmarkFactory.reconstitute(
        entity.id,
        entity.url,
        entity.userId,
        tags,
      );
    });
  }

  async getUserBookmark(
    inputUserId: string,
    bookmarkId: string,
  ): Promise<Bookmark | null> {
    const bookmarkEntity = await this.bookmarkRepository.findOne({
      where: {
        id: bookmarkId,
        userId: inputUserId,
      },
      relations: ['tags'],
    });
    if (!bookmarkEntity) {
      return null;
    }
    const { id, url, tags: tagEntities, userId } = bookmarkEntity;
    const tags = tagEntities.map((tagEntity) => {
      return this.tagFactory.reconstitute(tagEntity.id, tagEntity.tag);
    });
    return this.bookmarkFactory.reconstitute(id, url, userId, tags);
  }

  async getBookmarkByUrl(inputUrl: string): Promise<Bookmark | null> {
    const bookmarkEntity = await this.bookmarkRepository.findOne({
      where: {
        url: inputUrl,
      },
      relations: ['tags'],
    });
    if (!bookmarkEntity) {
      return null;
    }
    const { id, url, tags: tagEntities, userId } = bookmarkEntity;
    const tags = tagEntities.map((tagEntity) => {
      return this.tagFactory.reconstitute(tagEntity.id, tagEntity.tag);
    });
    return this.bookmarkFactory.reconstitute(id, url, userId, tags);
  }

  protected async findBookmarkByUrl(urls: string | string[]): Promise<any[]> {
    if (Array.isArray(urls) && urls.length <= 0) {
      return [];
    }

    if (!Array.isArray(urls)) {
      urls = [urls];
    }

    return await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select('*')
      .where(`url IN (:urls)`, { urls: urls })
      .getRawMany();
  }

  async getUserAllBookmarks(
    userId: string,
    page: any,
  ): Promise<Page<Bookmark>> {
    const tagProperty = () => {
      const id = `'id', "tag"."id"`;
      const tag = `'tag', "tag"."tag"`;

      return `${id},${tag}`;
    };
    const { count } = await this.getcount(userId);
    const bookmarks = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select(`bookmark.*`)
      .addSelect(`array_agg(json_build_object(${tagProperty()}))`, 'tags')
      .leftJoin(
        'bookmark_tag',
        'bookmark_tag',
        'bookmark_tag."bookmarkId" = bookmark.id',
      )
      .leftJoin('tag', 'tag', 'tag.id = bookmark_tag."tagId"')
      .where(`"userId" = :userId`, { userId: userId })
      .groupBy('bookmark.id')
      .orderBy('bookmark."createdAt"', 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    return new Page<Bookmark>(Number(count), page.take, bookmarks);
  }

  async getcount(userId: string): Promise<any> {
    const bookmarkCount = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select(`COUNT(bookmark.id)`)
      .where(`"userId" = :userId`, { userId: userId })
      .getRawMany();

    return bookmarkCount[0];
  }

  async syncBookmark(bookmarks: Bookmark[]): Promise<Bookmark[]> {
    const urls = bookmarks.map((bookmark) => {
      return bookmark.url;
    });
    const findBookmarkByUrls = await this.findBookmarkByUrl(urls);

    const noIdUrls = urls
      .filter((url) => {
        return !findBookmarkByUrls.includes(url);
      })
      .map((url) => {
        return {
          url: url,
          id: this.utilsService.getUuid(),
          userId: bookmarks[0].userId,
        };
      });
    const createdBookmarks = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .insert()
      .into('bookmark')
      .values(noIdUrls)
      .execute();

    const bookmarkIdAndTagIdArr = createdBookmarks.identifiers;

    const completedBookmarks = bookmarks.map((bookmark, i) => {
      const tags = bookmark.tags || [];

      const reconstitutedTag = tags.map((tag) => {
        const id = tag.id;
        const tagName = tag.tag;
        return this.tagFactory.reconstitute(id, tagName);
      });

      const bookmarks = this.bookmarkFactory.reconstitute(
        bookmarkIdAndTagIdArr[i].id,
        bookmark.url,
        bookmark.userId,
        reconstitutedTag,
      );

      return bookmarks;
    });

    return completedBookmarks;
  }

  async attachbulk(bookmarkTagMap: BookmarkTagMap[]): Promise<any> {
    const insertId = bookmarkTagMap.map((bookmarkTag) => {
      return { ...bookmarkTag, id: this.utilsService.getUuid() };
    });
    const attachBookmark = await this.bookmarkRepository
      .createQueryBuilder()
      .insert()
      .into(Bookmarks_TagsEntity)
      .values(insertId)
      .execute();
    return attachBookmark;
  }

  async findBookmarkTag_OR(
    userId: string,
    tags: string[],
    page: any,
  ): Promise<Page<Bookmark>> {
    //북마크 리파지토리로 바꾸면 성능 그대론가??
    //태그내용이 다 안나오니까 서브쿼리 사용 -> 셀프조인으로 안되나??
    const getMachedBookmarkId = this.tagRepository
      .createQueryBuilder('tag')
      .select(`DISTINCT bookmark."id"`, 'ids')
      .leftJoin(`bookmark_tag`, `bookmark_tag`, `bookmark_tag."tagId" = tag.id`)
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmark_tag."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(`tag."tag" in (:...tags)`, { tags: tags });

    const bookmarks = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`bookmark.*`)
      .addSelect(
        `array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`,
        'tags',
      )
      .leftJoin(`bookmark_tag`, `bookmark_tag`, `bookmark_tag."tagId" = tag.id`)
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmark_tag."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(
        `bookmark."id" in (${getMachedBookmarkId.getQuery()})`,
        getMachedBookmarkId.getParameters(),
      )
      .groupBy(`bookmark.id`)
      .orderBy(`bookmark."createdAt"`, 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    const count = bookmarks.length;

    return new Page<Bookmark>(count, page.take, bookmarks);
  }
  async findBookmarkTag_AND(
    userId: string,
    tags: string[],
    page: any,
  ): Promise<Page<Bookmark>> {
    const getMachedBookmarkId = this.tagRepository
      .createQueryBuilder('tag')
      .select(`bookmark.id`)
      .leftJoin(`bookmark_tag`, `bookmark_tag`, `bookmark_tag."tagId" = tag.id`)
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmark_tag."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(`tag."tag" in (:...tags)`, { tags: tags })
      .groupBy(`bookmark.id`)
      .having(`count(bookmark.id) > ${tags.length - 1}`);

    const bookmarks = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`bookmark.*`)
      .addSelect(
        `array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`,
        'tags',
      )
      .leftJoin(`bookmark_tag`, `bookmark_tag`, `bookmark_tag."tagId" = tag.id`)
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmark_tag."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(
        `bookmark."id" in (${getMachedBookmarkId.getQuery()})`,
        getMachedBookmarkId.getParameters(),
      )
      .groupBy(`bookmark.id`)
      .orderBy(`bookmark."createdAt"`, 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    const count = bookmarks.length;
    return new Page<Bookmark>(count, page.take, bookmarks);
  }
}
