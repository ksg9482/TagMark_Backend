import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { BookmarkRepository } from 'src/core/abstracts';
import { Bookmark, Bookmarks_Tags } from './model';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { BookmarkAndTag, BookmarkTagMap } from 'src/use-cases/interfaces/bookmark.interface';


@Injectable()
export class PostgresqlBookmarkRepository extends PostgresqlGenericRepository<Bookmark> implements BookmarkRepository {
    bookmarkRepository: Repository<Bookmark>;
    constructor(
        @Inject(Repository<Bookmark>)
        repository: Repository<Bookmark>
    ) {
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
        return await this.bookmarkRepository.find({ relations: ['tags'] })
    }

    async getUserBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
        return await this.bookmarkRepository.findOne({ where: { userId: userId, id: bookmarkId } })
    };
    async getBookmarkByUrl(url: string): Promise<Bookmark> {
        return await this.bookmarkRepository.findOne({ where: { url: url } });
    }
    async getUserAllBookmarks(userId: number, page: any): Promise<Page<Bookmark>> {
        const tagProperty = (/*entityName:string,properties:string[]*/) => {
            const name = 'tag'
            const test = ['id', 'tag']
            return `'id', "tag"."id",'tag', "tag"."tag"`
        }
        const { count } = await this.getcount(userId)
        const bookmarks = await this.bookmarkRepository.createQueryBuilder('bookmark')
            .select(`"bookmark".*`)
            .addSelect(`array_agg(json_build_object(${tagProperty()}))`, 'tags')
            .leftJoin('bookmarks_tags', 'bookmarks_tags', 'bookmarks_tags.bookmarkId = bookmark.id')
            .leftJoin('tag', 'tag', 'tag.id = bookmarks_tags.tagId')
            .where(`"userId" = ${userId}`)
            .groupBy("bookmark.id")
            .orderBy('bookmark."createdAt"', 'DESC')
            .limit(page.take)
            .offset(page.skip)
            .getRawMany()

        return new Page<Bookmark>(Number(count), page.take, bookmarks)
    }
    async getcount(userId: number): Promise<any> {
        const bookmarkCount = await this.bookmarkRepository.createQueryBuilder('bookmark')
            .select(`COUNT("bookmark".id)`)
            .where(`"userId" = ${userId}`)
            .getRawMany()

        return bookmarkCount[0]
    }
    
    async syncBookmark(bookmarks: Bookmark[]) {
        const createdBookmarks = await this.bookmarkRepository.createQueryBuilder()
            .insert()
            .into(Bookmark)
            .values(bookmarks)
            .execute();
            
        const bookmarkIdAndTagIdArr: any = createdBookmarks.identifiers;
        const completedBookmarks = bookmarks.map((bookmark, i) => {
            return { ...bookmark, id: bookmarkIdAndTagIdArr[i].id }
        })
        
        return completedBookmarks
    }

    async attachbulk(bookmarkTagMap: BookmarkTagMap[]) {

        const attachBookmark = await this.bookmarkRepository.createQueryBuilder()
            .insert()
            .into(Bookmarks_Tags)
            .values(bookmarkTagMap)
            .execute();

        return attachBookmark;
    }
}
