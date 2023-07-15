import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { ITagRepository } from 'src/cleanArchitecture/tag/domain/repository/itag.repository';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Bookmarks_Tags } from 'src/frameworks/data-services/postgresql/model/bookmarks_tags.model';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/cleanArchitecture/tag/infra/db/entity/tag.entity';
import { TagFactory } from 'src/cleanArchitecture/tag/domain/tag.factory';

@Injectable()
export class TagRepository implements ITagRepository {
  //   TagRepository: Repository<Tag>;
  constructor(
    @InjectRepository(TagEntity) private tagRepository: Repository<TagEntity>,
    private tagFactory: TagFactory,
    BookmarksTagsRepository: Repository<Bookmarks_Tags>,
  ) {}
  createTag: (item: string) => Promise<Tag>;
  getAllTags: () => Promise<Tag[]>;

  async get(inputId: string): Promise<Tag | null> {
    const tagEntity = await this.tagRepository.findOne({
      where: { id: inputId },
    });
    if (!tagEntity) {
      return null;
    }
    const { id, tag } = tagEntity;
    return this.tagFactory.reconstitute(id, tag);
  }

  async create(item: Partial<Tag>): Promise<Tag> {
    return await this.tagRepository.save(this.tagRepository.create(item));
  }
  createForm(tag: string): Tag {
    return this.tagRepository.create();
  }

  async update(id: number, item: Tag): Promise<any> {
    return await this.tagRepository.update(id, item);
  }

  async getAll(): Promise<Tag[]> {
    return await this.tagRepository.find();
  }

  async findByTagNames(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.tag IN (:...tags)', { tags: tagNames })
      .getMany();

    return tags;
  }
  async getTagsByIds(tagId: number[]): Promise<Tag[]> {
    const tags = await this.tagRepository
      .createQueryBuilder()
      .select()
      .whereInIds(tagId)
      .getMany();

    return tags;
  }
  async attachTag(bookmarkId: number, tags: Tag[]): Promise<any[]> {
    const arr: any[] = [];
    tags.forEach(async (tag) => {
      const check = await this.tagRepository
        .createQueryBuilder()
        .from('bookmarks_tags', 'bookmarks_tags')
        .where(
          'bookmarks_tags."bookmarkId" = (:bookmarkId) and bookmarks_tags."tagId" = (:tagId)',
          { bookmarkId: bookmarkId, tagId: tag.getId() },
        )
        .getRawOne();

      if (check) {
        arr.push(check);
        return;
      }

      const attachTag = await this.tagRepository
        .createQueryBuilder()
        .insert()
        .into('bookmarks_tags')
        .values({ bookmarkId: bookmarkId, tagId: tag.getId() })
        .execute();

      arr.push(attachTag);
    });

    return arr;
  }

  async detachTag(bookmarkId: number, tagIds: number[]): Promise<any> {
    const deletedTag = await this.tagRepository
      .createQueryBuilder()
      .delete()
      .from('bookmarks_tags', 'bookmarks_tags')
      .where(
        `bookmarks_tags."bookmarkId" = (:bookmarkId) AND bookmarks_tags."tagId" IN (:...tagIds)`,
        { bookmarkId: bookmarkId, tagIds: tagIds },
      )
      .execute();

    return deletedTag;
  }

  async insertBulk(tags: Tag[]): Promise<any> {
    const tagInsertBultk = await this.tagRepository
      .createQueryBuilder()
      .insert()
      .into('tag')
      .values(tags)
      .execute();

    return tagInsertBultk;
  }

  async getUserAllTags(userId: number): Promise<Tag[]> {
    const tags: Tag[] = await this.tagRepository
      .createQueryBuilder('tag')
      .select(`tag.*, COUNT(bookmark.id)`)
      .leftJoin(
        `bookmarks_tags`,
        `bookmarks_tags`,
        `bookmarks_tags."tagId" = tag.id`,
      )
      .innerJoin(
        `bookmark`,
        `bookmark`,
        `bookmark.id = bookmarks_tags."bookmarkId"`,
      )
      .where(`bookmark."userId" = (:userId) OR bookmark."userId" IS NULL`, {
        userId: userId,
      })
      .groupBy('tag.id')
      .orderBy('count', 'DESC')
      .getRawMany();

    return tags;
  }

  async getTagSeatchOR(
    userId: number,
    tags: string[],
    page: any,
  ): Promise<Page<Bookmark>> {
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
  async getTagSearchAND(
    userId: number,
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
