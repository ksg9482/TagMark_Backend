import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { TagRepository } from 'src/core/abstracts';
import { Tag, Bookmark, Bookmarks_Tags } from './model';

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
        return await this.TagRepository.findOne({where:{id:id}})
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
            //1. 입력된 태그들을 IN으로 일괄검색 -> 있는거 찾고 없는거 만들기 -> 태그배열생성
            //1-2. 태그배열로 조인테이블에 유무확인. 있는거 넘기고 태그배열로 없는 거 일괄생성.
            //2. sql문으로 하기. 서브쿼리+파라미터로 하면 대량처리 될지도? 
            //const check = await this.bookmarksTags.findOne({ where: { bookmarkId: bookmarkId, tagId: tag.id } });
            const check = await this.TagRepository.createQueryBuilder()
                .from('bookmarks_tags', 'bookmarks_tags')
                .where('bookmarks_tags."bookmarkId" = (:bookmarkId) and bookmarks_tags."tagId" = (:tagId)', { bookmarkId: bookmarkId, tagId: tag.id })
                .getRawOne()
            if (check) {
                arr.push(check)
                return;
            }
            // const attachTag = await this.bookmarksTags.save(this.bookmarksTags.create({
            //     bookmarkId: bookmarkId,
            //     tagId: tag.id
            // }))
            const attachTag = await this.TagRepository.createQueryBuilder()
                .insert()
                .into('bookmarks_tags')
                .values({ bookmarkId: bookmarkId, tagId: tag.id })
                .execute()
            arr.push(attachTag)
        })
        // const attachTag = await this.bookmarksTags.save(this.bookmarksTags.create({
        //     bookmarkId: bookmarkId,
        //     tagId: tag.id
        // }))
        // const attachBulk = await this.TagRepository.createQueryBuilder()
        //     .insert()
        //     .into('bookmarks_tags')
        //     .values(tags)
        //     .execute()
        return arr
    };

    async detachTag(bookmarkId: number, tagIds: number[]) {
        const deletedTag = await this.TagRepository
            .createQueryBuilder(/*"bookmarks_tags"*/)
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
            .select(`DISTINCT tag.*`)
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} OR bookmark."userId" IS NULL`)
            .orderBy('tag.id','ASC')
            .getRawMany()
        return tags
    }

    //반환이 북마크면 북마크로 가는게 좋지 않을까?
    async getTagSeatchOR(userId: number, tags: string[]): Promise<Bookmark[]> {
        const addDot = tags.map((tag) => { return `'${tag}'` })
        
        const bookmarks: Bookmark[] = await this.TagRepository.createQueryBuilder('tag')
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
            .getRawMany()
            //console.log(bookmarks)
        return bookmarks
    }
    async getTagSearchAND(userId: number, tags: string[]): Promise<Bookmark[]> {
        const addDot = tags.map((tag) => { return `'${tag}'` })
        const bookmarks: Bookmark[] = await this.TagRepository.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} and ("tag"."tag" in (${addDot}))`)
            .groupBy(`bookmark.id`)
            .having(`count("bookmark"."id") > ${tags.length - 1}`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .getRawMany()
        return bookmarks
    }

}