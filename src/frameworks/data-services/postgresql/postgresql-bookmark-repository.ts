import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { BookmarkRepository } from 'src/core/abstracts';
import { Bookmark, Bookmarks_Tags } from './model';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';

export interface BookmarkAndTag extends Pick<Bookmarks_Tags, 'bookmarkId'> {
    tagIds: number[];
};

export interface BookmarkTagMap extends Pick<Bookmarks_Tags, 'bookmarkId' | 'tagId'> {};

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
    //북마크 내부에 이미 userId 들어가있음
    async syncBookmark(userId: number, bookmarks: Bookmark[]) {
        //태그는 이미 등록되어 있음. 북마크를 넣고 결과값을 받는다.
        const createdBookmarks = await this.bookmarkRepository.createQueryBuilder()
            .insert()
            .into(Bookmark)
            .values(bookmarks)
            .execute();
            
        //따로따로 넘겨주지 않는 이유는 태그 없으면 그 북마크는 연결 못시킴. -> 길이 안맞으니 미리 폼 만들어서 안정성 증가. 
        const bookmarkIdAndTagIdArr: any = createdBookmarks.identifiers;
        const completedBookmarks = bookmarks.map((bookmark, i) => {
            return { ...bookmark, id: bookmarkIdAndTagIdArr[i].id }
        })
        const result = await this.attachbulk(completedBookmarks);
        //북마크 아이디, 태그 아이디 받아서 

        return createdBookmarks
    }

    protected async attachbulk(bookmarks: Bookmark[]) {
        //여기부터
        
        const getBookmarkIdAndTagId = (bookmarks: Bookmark[]) => {
            const result = bookmarks.map((bookmark) => {
                if (bookmark.tags.length <= 0) {
                    return;
                }
                const bookmarkId = bookmark.id
                const tagIds = bookmark.tags.map((tag) => {
                    return tag.id;
                })
                return { bookmarkId, tagIds }
            })
            return result;
        };

        const getBookmarkTagMap = (bookmarksAndTags: BookmarkAndTag[]):BookmarkTagMap[] => {
            const bookmarkTagMap:BookmarkTagMap[] = [];
            for (let bookmarksTags of bookmarksAndTags) {
                for (let tagId of bookmarksTags.tagIds) {
                    bookmarkTagMap.push(
                        {
                            bookmarkId: bookmarksTags.bookmarkId,
                            tagId: tagId
                        }
                    )
                }
            }
            return bookmarkTagMap
        };

        const bookmarksAndTags = getBookmarkIdAndTagId(bookmarks);
        const bookmarksAndTagsMap = getBookmarkTagMap(bookmarksAndTags);

        //여기까지 유즈케이스로?
        const attachBookmark = await this.bookmarkRepository.createQueryBuilder()
            .insert()
            .into(Bookmarks_Tags)
            .values(bookmarksAndTagsMap)
            .execute();

        return attachBookmark;
    }
}
