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

    async get(id: any): Promise<Tag> {
        return await this.TagRepository.findOne({ where: { id: id } })
    }
    async create(item: Partial<Tag>): Promise<Tag> {
        return await this.TagRepository.save(this.TagRepository.create(item))
    }

    createForm(item: Partial<Tag>): Tag {
        return this.TagRepository.create(item)
    }

    async update(id: number, item: Tag): Promise<any> {
        return await this.TagRepository.update(id, item);
    };

    async getAll(): Promise<Tag[]> {
        return await this.TagRepository.find()
    }

    async getUserTag(userId: number, TagId: number): Promise<Tag> {
        return await this.TagRepository.findOne({ where: { id: TagId } })
    };

    async findByTagNames(tagNames: string[]): Promise<Tag[]> {
        const tags: Tag[] = await this.TagRepository.createQueryBuilder("tag")
            .where("tag.tag IN (:...tags)", { "tags": tagNames })
            .getMany();
        return tags
    }
    async getTagsByIds(tagId: number[]) {
        const tags = await this.TagRepository.createQueryBuilder()
            .select()
            .whereInIds(tagId)
            .getMany()
        return tags
    };
    async attachTag(userId: number, bookmarkId: number, tags: Tag[]) {
        const arr = []
        tags.forEach(async (tag) => {
            const check = await this.TagRepository.createQueryBuilder()
                .from('bookmarks_tags', 'bookmarks_tags')
                .where('bookmarks_tags."bookmarkId" = (:bookmarkId) and bookmarks_tags."tagId" = (:tagId)', { bookmarkId: bookmarkId, tagId: tag.id })
                .getRawOne()
            if (check) {
                arr.push(check)
                return;
            }
            
            const attachTag = await this.TagRepository.createQueryBuilder()
                .insert()
                .into('bookmarks_tags')
                .values({ bookmarkId: bookmarkId, tagId: tag.id })
                .execute()
            arr.push(attachTag)
        })
        
        return arr;
    };

    async detachTag(bookmarkId: number, tagIds: number[]) {
        const deletedTag = await this.TagRepository
            .createQueryBuilder()
            .delete()
            .from("bookmarks_tags", "bookmarks_tags")
            .where(`bookmarks_tags."bookmarkId" = ${bookmarkId} AND bookmarks_tags."tagId" IN (${tagIds})`)
            .execute()
        return deletedTag
    };

    async insertBulk(tags: Tag[]) {
        const tagInsertBultk = await this.TagRepository.createQueryBuilder()
            .insert()
            .into('tag')
            .values(tags)
            .execute()
        return tagInsertBultk
    }

    async getUserAllTags(userId: number): Promise<Tag[]> {
        const tags: Tag[] = await this.TagRepository.createQueryBuilder('tag')
            .select(`tag.*, COUNT(bookmark.id)`)
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .innerJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} OR bookmark."userId" IS NULL`)
            .groupBy('tag.id')
            .orderBy('count', 'DESC')
            .getRawMany()
        return tags
    }

   
    async getTagSeatchOR(userId: number, tags: string[], page: any): Promise<Page<Bookmark>> {
        const addDot = tags.map((tag) => { return `'${tag}'` })
        const bookmarks = await this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} and ("bookmark"."id" in (      
	            SELECT DISTINCT "bookmark"."id" AS "ids" 
	            FROM "tag" "tag" 
	            LEFT JOIN "bookmarks_tags" "bookmarks_tags" ON bookmarks_tags."tagId" = "tag"."id"  
	            LEFT JOIN "bookmark" "bookmark" ON "bookmark"."id" = bookmarks_tags."bookmarkId" 
	            WHERE bookmark."userId" = 1 and ("tag"."tag" in (${addDot}))
            ))`)
            .groupBy(`bookmark.id`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .limit(page.take)
            .offset(page.skip)
            .getRawMany()
        const count = bookmarks.length;
        return new Page<Bookmark>(count, page.take, bookmarks)
    }
    async getTagSearchAND(userId: number, tags: string[], page: any): Promise<Page<Bookmark>> {
        const addDot = tags.map((tag) => { return `'${tag}'` })
        const bookmarks = await this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} and ("bookmark"."id" in (      
	            SELECT bookmark.id 
                FROM "tag" "tag" 
                LEFT JOIN "bookmarks_tags" "bookmarks_tags" ON bookmarks_tags."tagId" = "tag"."id"  
                LEFT JOIN "bookmark" "bookmark" ON "bookmark"."id" = bookmarks_tags."bookmarkId" 
                WHERE bookmark."userId" = 1 and ("tag"."tag" in (${addDot}))
                GROUP BY bookmark.id
                HAVING count(bookmark.id) > ${tags.length - 1}
            ))`)
            .groupBy(`bookmark.id`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .limit(page.take)
            .offset(page.skip)
            .getRawMany()
        const count = bookmarks.length;
        return new Page<Bookmark>(count, page.take, bookmarks)
    }

}