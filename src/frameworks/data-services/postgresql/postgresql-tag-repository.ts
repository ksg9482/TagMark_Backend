import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { TagRepository } from 'src/core/abstracts';
import { Tag, Bookmark, Bookmarks_Tags } from './model';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';

@Injectable()
export class PostgresqlTagRepository extends PostgresqlGenericRepository<Tag> implements TagRepository {
    TagRepository: Repository<Tag>;
    BookmarksTagsRepository: Repository<Bookmarks_Tags>
    constructor(
        @Inject(Repository<Tag>)
        repository: Repository<Tag>
    ) {
        super(repository);
        this.TagRepository = repository;
    };

    async get(id: any): Promise<Tag | null> {
        return await this.TagRepository.findOne({ where: { id: id } });
    }
    async create(item: Partial<Tag>): Promise<Tag> {
        return await this.TagRepository.save(this.TagRepository.create(item));
    }

    createForm(item: Partial<Tag>): Tag {
        return this.TagRepository.create(item);
    }

    async update(id: number, item: Tag): Promise<any> {
        return await this.TagRepository.update(id, item);
    };

    async getAll(): Promise<Tag[]> {
        return await this.TagRepository.find();
    }


    async findByTagNames(tagNames: string[]): Promise<Tag[]> {
        const tags: Tag[] = await this.TagRepository.createQueryBuilder("tag")
            .where("tag.tag IN (:...tags)", { "tags": tagNames })
            .getMany();

        return tags;
    }
    async getTagsByIds(tagId: number[]): Promise<Tag[]> {
        const tags = await this.TagRepository.createQueryBuilder()
            .select()
            .whereInIds(tagId)
            .getMany();

        return tags;
    };
    async attachTag(bookmarkId: number, tags: Tag[]): Promise<any[]> {
        const arr:any[] = [];
        tags.forEach(async (tag) => {
            const check = await this.TagRepository.createQueryBuilder()
                .from('bookmarks_tags', 'bookmarks_tags')
                .where('bookmarks_tags."bookmarkId" = (:bookmarkId) and bookmarks_tags."tagId" = (:tagId)', { bookmarkId: bookmarkId, tagId: tag.id })
                .getRawOne();

            if (check) {
                arr.push(check);
                return;
            }

            const attachTag = await this.TagRepository.createQueryBuilder()
                .insert()
                .into('bookmarks_tags')
                .values({ bookmarkId: bookmarkId, tagId: tag.id })
                .execute();

            arr.push(attachTag);
        });

        return arr;
    };

    async detachTag(bookmarkId: number, tagIds: number[]): Promise<any> {
        const deletedTag = await this.TagRepository
            .createQueryBuilder()
            .delete()
            .from("bookmarks_tags", "bookmarks_tags")
            .where(`bookmarks_tags."bookmarkId" = (:bookmarkId) AND bookmarks_tags."tagId" IN (:...tagIds)`, { bookmarkId: bookmarkId, tagIds: tagIds })
            .execute();

        return deletedTag;
    };

    async insertBulk(tags: Tag[]): Promise<any> {
        const tagInsertBultk = await this.TagRepository.createQueryBuilder()
            .insert()
            .into('tag')
            .values(tags)
            .execute();

        return tagInsertBultk;
    }

    async getUserAllTags(userId: number): Promise<Tag[]> {
        const tags: Tag[] = await this.TagRepository.createQueryBuilder('tag')
            .select(`tag.*, COUNT(bookmark.id)`)
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .innerJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = (:userId) OR bookmark."userId" IS NULL`, { userId: userId })
            .groupBy('tag.id')
            .orderBy('count', 'DESC')
            .getRawMany();

        return tags;
    }


    async getTagSeatchOR(userId: number, tags: string[], page: any): Promise<Page<Bookmark>> {

        const getMachedBookmarkId = this.TagRepository.createQueryBuilder('tag')
            .select(`DISTINCT "bookmark"."id"`, 'ids')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = (:userId)`, { userId: userId })
            .andWhere(`"tag"."tag" in (:...tags)`, { tags: tags });

        const bookmarks = await this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = (:userId)`, { userId: userId })
            .andWhere(`"bookmark"."id" in (${getMachedBookmarkId.getQuery()})`, getMachedBookmarkId.getParameters())
            .groupBy(`bookmark.id`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .limit(page.take)
            .offset(page.skip)
            .getRawMany();

        const count = bookmarks.length;

        return new Page<Bookmark>(count, page.take, bookmarks);
    }
    async getTagSearchAND(userId: number, tags: string[], page: any): Promise<Page<Bookmark>> {

        const getMachedBookmarkId = this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.id`)
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = (:userId)`, { userId: userId })
            .andWhere(`"tag"."tag" in (:...tags)`, { tags: tags })
            .groupBy(`bookmark.id`)
            .having(`count(bookmark.id) > ${tags.length - 1}`);

        const bookmarks = await this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = (:userId)`, { userId: userId })
            .andWhere(`"bookmark"."id" in (${getMachedBookmarkId.getQuery()})`, getMachedBookmarkId.getParameters())
            .groupBy(`bookmark.id`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .limit(page.take)
            .offset(page.skip)
            .getRawMany();

        const count = bookmarks.length;
        return new Page<Bookmark>(count, page.take, bookmarks);
    }

}