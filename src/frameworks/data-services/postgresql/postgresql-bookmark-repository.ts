import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { BookmarkRepository } from 'src/core/abstracts';
import { Bookmark } from './model';

@Injectable()
export class PostgresqlBookmarkRepository extends PostgresqlGenericRepository<Bookmark> implements BookmarkRepository  {
    bookmarkRepository: Repository<Bookmark>;
    constructor(
        @Inject(Repository<Bookmark>)
        repository: Repository<Bookmark>
    ){
        super(repository);
        this.bookmarkRepository = repository;
    }
;

    async create(item: Partial<Bookmark>): Promise<Bookmark> {
        return await this.bookmarkRepository.save(this.bookmarkRepository.create(item))
    }

    async update(id: number, item: Bookmark): Promise<any> {
        return await this.bookmarkRepository.update(id, item);
    };

    async getAll(): Promise<Bookmark[]> {
        return await this.bookmarkRepository.find({relations:['tags']})
    }

    async getUserBookmark(userId: number, bookmarkId:number): Promise<Bookmark> {
        return await this.bookmarkRepository.findOne({where:{userId:userId, id:bookmarkId}})
    };
    async getBookmarkByUrl(url: string): Promise<Bookmark> {
        return await this.bookmarkRepository.findOne({where:{url:url}});
    }
    async getUserAllBookmarks(userId:number): Promise<Bookmark[]> {
        const tagProperty = (/*entityName:string,properties:string[]*/) => {
            const name = 'tag'
            const test = ['id', 'tag']
            return `'id', "tag"."id",'tag', "tag"."tag"`
        }
        const bookmarks = await this.bookmarkRepository.createQueryBuilder('bookmark')
        .select(`"bookmark".*`)
        .addSelect(`array_agg(json_build_object(${tagProperty()}))`, 'tags')
        .leftJoin('bookmarks_tags', 'bookmarks_tags','bookmarks_tags.bookmarkId = bookmark.id')
        .leftJoin('tag', 'tag', 'tag.id = bookmarks_tags.tagId')
        .where(`"userId" = ${userId}`)
        .groupBy("bookmark.id")
        .orderBy('bookmark."createdAt"', 'DESC')
        .getRawMany()
        return bookmarks
    }
    async getcount(userId: number): Promise<any> {
        const bookmarkCount = await this.bookmarkRepository.createQueryBuilder('bookmark')
        .select(`COUNT("bookmark".id)`)
        .where(`"userId" = ${userId}`)
        .getRawMany()
        
        return bookmarkCount[0]
    }
}