import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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
import { DeleteDto } from '../dto/delete.dto';
import { SaveDto } from '../dto/save.dto';
import { UpdateDto } from '../dto/update.dto';
import { GetAllDto } from '../dto/get-all.dto';
import { GetDto } from '../dto/get.dto';
import { BookmarkWithCountDto } from '../dto/bookmark-with-count.dto';

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
    const entity = this.bookmarkRepository.create({ id: id });
    await this.bookmarkRepository.delete(entity.id);
    return new DeleteDto(entity);
  }

  async save(item: BookmarkSaveDto): Promise<SaveDto> {
    const { url, userId } = item;

    const bookmarkEntity = this.bookmarkRepository.create({
      id: this.utilsService.getUuid(),
      url: url,
      userId: userId,
    });

    await this.bookmarkRepository.save(bookmarkEntity);

    return new SaveDto(bookmarkEntity);
  }

  async update(id: string, item: Bookmark): Promise<UpdateDto> {
    const entity = this.bookmarkRepository.create({ id: id, url: item.url });
    await this.bookmarkRepository.update(id, { url: item.url });
    return new UpdateDto(entity);
  }

  async getAll(): Promise<GetAllDto> {
    const bookmarkEntities = await this.bookmarkRepository.find({
      relations: ['tags'],
    });
    if (bookmarkEntities.length <= 0) {
      return new GetAllDto([]);
    }

    return new GetAllDto(bookmarkEntities);
  }

  async getUserBookmark(
    inputUserId: string,
    bookmarkId: string,
  ): Promise<GetDto | null> {
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

    return new GetDto(bookmarkEntity);
  }

  async getBookmarkByUrl(inputUrl: string): Promise<GetDto | null> {
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
    return new GetDto(bookmarkEntity);
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
      const tagEntities = bookmark.tags.map((tag: { id: any; tag: any }) => {
        return this.tagRepository.create({ id: tag.id, tag: tag.tag });
      });
      return this.bookmarkRepository.create({
        id: bookmark.id,
        userId: bookmark.userId,
        url: bookmark.url,
        tags: tagEntities,
      });
    });
    return new BookmarkWithCountDto(bookmarksInstance, Number(count));
  }

  async getcount(userId: string): Promise<any> {
    const bookmarkCount = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select(`COUNT(bookmark.id)`)
      .where(`"userId" = :userId`, { userId: userId })
      .getRawMany();

    return bookmarkCount[0];
  }

  async syncBookmark(bookmarks: Bookmark[]): Promise<GetAllDto> {
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

    return new GetAllDto(
      completedBookmarks.map((bookmark) => {
        return this.bookmarkRepository.create({
          id: bookmark.id,
          userId: bookmark.userId,
          url: bookmark.url,
          tags: bookmark.tags,
        });
      }),
    );
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
      const tagEntities = bookmark.tags.map((tag: { id: any; tag: any }) => {
        return this.tagRepository.create({ id: tag.id, tag: tag.tag });
      });
      return this.bookmarkRepository.create({
        id: bookmark.id,
        userId: bookmark.userId,
        url: bookmark.url,
        tags: tagEntities,
      });
    });
    return new BookmarkWithCountDto(bookmarksInstance, Number(count));
  }
  async findBookmarkTag_AND(userId: string, tags: string[], page: any) {
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
      const tagEntities = bookmark.tags.map((tag: { id: any; tag: any }) => {
        return this.tagRepository.create({ id: tag.id, tag: tag.tag });
      });
      return this.bookmarkRepository.create({
        id: bookmark.id,
        userId: bookmark.userId,
        url: bookmark.url,
        tags: tagEntities,
      });
    });
    return new BookmarkWithCountDto(bookmarksInstance, Number(count));
  }
}
