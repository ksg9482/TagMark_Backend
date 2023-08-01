import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { IBookmarkRepository } from 'src/cleanArchitecture/bookmark/domain/repository/ibookmark.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BookmarkEntity } from 'src/cleanArchitecture/bookmark/infra/db/entity/bookmark.entity';
import { Bookmarks_TagsEntity } from 'src/cleanArchitecture/bookmark/infra/db/entity/bookmarks_tags.entity';
import { BookmarkFactory } from 'src/cleanArchitecture/bookmark/domain/bookmark.factory';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { TagFactory } from 'src/cleanArchitecture/tag/domain/tag.factory';
import { TagEntity } from 'src/cleanArchitecture/tag/infra/db/entity/tag.entity';
import { BookmarkTagMap } from 'src/cleanArchitecture/bookmark/domain/bookmark.interface';

//북마크가 가져야 하는게 태그 엔티티인지 태그 도메인 객체인지 불명확. 이거 확실히 해야함
@Injectable()
export class PostgresqlBookmarkRepository implements IBookmarkRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,
    private tagRepository: Repository<TagEntity>,
    private bookmarkFactory: BookmarkFactory,
    private tagFactory: TagFactory,
  ) {}
  get: (id: string) => Promise<Bookmark | null>;
  delete: (id: string) => Promise<any>;

  createEntity(userId:string, url:string): BookmarkEntity {
    const uuid = () => {
      const tokens = uuidV4().split('-');
      return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    };
    return this.bookmarkRepository.create({ id: uuid(), url: url, userId: userId});
  }

  async save(
    url: string,
    userId: string,
    tags: Tag[],
  ): Promise<Bookmark> {
    
    const bookmarkEntity = this.createEntity(userId, url);
    await this.bookmarkRepository.save(bookmarkEntity);
    return this.bookmarkFactory.reconstitute(bookmarkEntity.id, bookmarkEntity.url, bookmarkEntity.userId, tags);
  }

  async update(id: string, item: any): Promise<any> {
    return await this.bookmarkRepository.update(id, item);
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
      .select(`"bookmark".*`)
      .addSelect(`array_agg(json_build_object(${tagProperty()}))`, 'tags')
      .leftJoin(
        'bookmarks_tags',
        'bookmarks_tags',
        'bookmarks_tags.bookmarkId = bookmark.id',
      )
      .leftJoin('tag', 'tag', 'tag.id = bookmarks_tags.tagId')
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
      .select(`COUNT("bookmark".id)`)
      .where(`"userId" = :userId`, { userId: userId })
      .getRawMany();

    return bookmarkCount[0];
  }

  async syncBookmark(bookmarks: Bookmark[]): Promise<Bookmark[]> {
    const createdBookmarks = await this.bookmarkRepository
      .createQueryBuilder()
      .insert()
      .into(Bookmark)
      .values(bookmarks)
      .execute();

    const bookmarkIdAndTagIdArr = createdBookmarks.identifiers;
    const completedBookmarks = bookmarks.map((bookmark, i) => {
      const tags = bookmark.getTags();
      const reconstitutedTag = tags.map((tag) => {
        const id = tag.getId();
        const tagName = tag.getTag();
        return this.tagFactory.reconstitute(id, tagName);
      });
      const bookmarks = this.bookmarkFactory.reconstitute(
        bookmarkIdAndTagIdArr[i].id,
        bookmark.getUrl(),
        bookmark.getUserId(),
        reconstitutedTag,
      );

      return bookmarks;
    });

    return completedBookmarks;
  }

  async attachbulk(bookmarkTagMap: BookmarkTagMap[]): Promise<any> {
    const attachBookmark = await this.bookmarkRepository
      .createQueryBuilder()
      .insert()
      .into(Bookmarks_TagsEntity)
      .values(bookmarkTagMap)
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
      .select(`DISTINCT "bookmark"."id"`, 'ids')
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(`"tag"."tag" in (:...tags)`, { tags: tags });

    const bookmarks = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`bookmark.*`)
      .addSelect(
        `array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`,
        'tags',
      )
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(
        `"bookmark"."id" in (${getMachedBookmarkId.getQuery()})`,
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
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(`"tag"."tag" in (:...tags)`, { tags: tags })
      .groupBy(`bookmark.id`)
      .having(`count(bookmark.id) > ${tags.length - 1}`);

    const bookmarks = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`bookmark.*`)
      .addSelect(
        `array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`,
        'tags',
      )
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .leftJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId)`, { userId: userId })
      .andWhere(
        `"bookmark"."id" in (${getMachedBookmarkId.getQuery()})`,
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
