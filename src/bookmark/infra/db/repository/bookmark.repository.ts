import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import {
  BookmarkPage,
  Page,
} from 'src/bookmark/application/bookmark.pagination';
import {
  BookmarkSaveDto,
  BookmarkRepository,
} from 'src/bookmark/domain/repository/bookmark.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BookmarkEntity } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { Bookmarks_TagsEntity } from 'src/bookmark/infra/db/entity/bookmarks_tags.entity';
import { BookmarkFactory } from 'src/bookmark/domain/bookmark.factory';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { BookmarkTagMap } from 'src/bookmark/domain/bookmark.interface';
import { UtilsService } from 'src/utils/utils.service';
import { Tags } from 'src/tag/domain/tags';

@Injectable()
export class BookmarkRepositoryImpl implements BookmarkRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    private readonly bookmarkRepository: Repository<BookmarkEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly bookmarkFactory: BookmarkFactory,
    private readonly tagFactory: TagFactory,
    private readonly utilsService: UtilsService,
  ) {}

  async delete(id: string) {
    const deleteBookmark = await this.bookmarkRepository.delete(id);
    return deleteBookmark;
  }

  async save(item: BookmarkSaveDto): Promise<Bookmark> {
    const { url, userId } = item;

    const bookmarkEntity = this.bookmarkRepository.create({
      id: this.utilsService.getUuid(),
      url: url,
      userId: userId,
    });

    await this.bookmarkRepository.save(bookmarkEntity);

    return this.bookmarkFactory.reconstitute(
      bookmarkEntity.id,
      bookmarkEntity.url,
      bookmarkEntity.userId,
    );
  }

  async update(id: string, item: Bookmark): Promise<any> {
    const bookmark = item;
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
      const tagsInstance = new Tags(tags);
      return this.bookmarkFactory.reconstitute(
        entity.id,
        entity.url,
        entity.userId,
        tagsInstance,
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
    return this.bookmarkFactory.reconstitute(id, url, userId, new Tags(tags));
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
    return this.bookmarkFactory.reconstitute(id, url, userId, new Tags(tags));
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

  async getUserAllBookmarks(userId: string, page: any) {
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

    const bookmarksInstance = bookmarks.map((bookmark) => {
      const tags = new Tags(bookmark.tags);
      return Bookmark.from(bookmark.id, bookmark.userId, bookmark.url, tags);
    });
    return new BookmarkPage(Number(count), page.take, bookmarksInstance);

    //return new Page<Bookmark>(Number(count), page.take, bookmarksInstance);
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
        new Tags(reconstitutedTag),
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

  async findBookmarkTag_OR(userId: string, tags: string[], page: any) {
    /**
     * tag를 기준으로 삼기 때문에 tagRepository를 이용하였다.
     */
    const machedBookmarkIds = this.tagRepository
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
        `bookmark."id" in (${machedBookmarkIds.getQuery()})`,
        machedBookmarkIds.getParameters(),
      )
      .groupBy(`bookmark.id`)
      .orderBy(`bookmark."createdAt"`, 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    const count = bookmarks.length;

    const bookmarksInstance = bookmarks.map((bookmark) => {
      const tags = new Tags(bookmark.tags);
      return Bookmark.from(bookmark.id, bookmark.userId, bookmark.url, tags);
    });
    return new BookmarkPage(Number(count), page.take, bookmarksInstance);
    //return new Page<Bookmark>(count, page.take, bookmarksInstance);
  }
  async findBookmarkTag_AND(userId: string, tags: string[], page: any) {
    /**
     * tag를 기준으로 삼기 때문에 tagRepository를 이용하였다.
     */
    const machedBookmarkIds = this.tagRepository
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
        `bookmark."id" in (${machedBookmarkIds.getQuery()})`,
        machedBookmarkIds.getParameters(),
      )
      .groupBy(`bookmark.id`)
      .orderBy(`bookmark."createdAt"`, 'DESC')
      .limit(page.take)
      .offset(page.skip)
      .getRawMany();

    const count = bookmarks.length;
    const bookmarksInstance = bookmarks.map((bookmark) => {
      const tags = new Tags(bookmark.tags);
      return Bookmark.from(bookmark.id, bookmark.userId, bookmark.url, tags);
    });
    return new BookmarkPage(Number(count), page.take, bookmarksInstance);
    //return new Page<Bookmark>(count, page.take, bookmarksInstance);
  }
}
