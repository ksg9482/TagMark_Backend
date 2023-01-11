import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateBookmarkDto, GetUserAllBookmarksDto } from "src/controllers/dtos";
import { Bookmark } from "src/core/entities";
import { Page } from "./bookmark.pagination";
import { BookmarkAndTag, BookmarkTagMap } from "../interfaces/bookmark.interface";


export class BookmarkUseCases {
    constructor(
        @Inject(DataServices)
        private dataService: DataServices,
    ) { }

    async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
        const { tagNames, url } = createBookmarkDto;
        const bookmark = await this.dataService.bookmarks.getBookmarkByUrl(url)
        if (bookmark) {
            throw new HttpException('Bookmark is aleady exist', HttpStatus.BAD_REQUEST)
        }

        const createdBookmark = await this.dataService.bookmarks.create({
            url: url,
            userId: userId,
            tags: tagNames
        });

        return createdBookmark;
    }

    async getAllBookmarks() {
        return await this.dataService.bookmarks.getAll()
    }

    async getUserAllBookmarks(userId: number, page: GetUserAllBookmarksDto) {
        const limit = page.getLimit()
        const offset = page.getOffset()

        const bookmarks: Page<Bookmark> = await this.dataService.bookmarks.getUserAllBookmarks(
            userId,
            {
                take: limit,
                skip: offset
            }
        );
        this.bookmarksNullCheck(bookmarks.bookmarks)
        const bookmarksForm = this.bookmarksNullCheck(bookmarks.bookmarks)
        return { ...bookmarks, bookmarks: bookmarksForm }
    }

    protected bookmarksNullCheck(bookmarks: Bookmark[]) {
        const result = bookmarks.map((bookmark) => {
            if (!bookmark.tags[0]) {
                bookmark.tags = null
            }
            return bookmark
        })
        return result
    }

    async getUserBookmarkCount(userId: number) {
        const { count } = await this.dataService.bookmarks.getcount(userId)
        return count
    }


    /*
    처음에는 그냥 방어적으로 에러 나올만한 부분에 예외처리
    그 다음에는 트라이 캐치에 넣어놓으면 캐치로 들어가니까 컨트롤러에만 트라이캐치해서 잡게 만들었다.
    지금은 함수를 트라이캐치블로에 넣는걸로 한다. 왜? 에러 처리할때 그게 더 명확히 할 수 있으니까.
    
    트라이캐치 범벅인건 어떻게 보일러 플레이트인데? 래핑할 생각. 
    
    
    연동 db연결.
    프론트엔드 페이지, 블럭, 아톰 나누기.
    인터페이스 정리
    안쓰는거 정리해서 ver2넘길 준비
    ws 뒤에 was 놔두기
    도커에 넣기
    서버는 ec2 프론트는 s3로.
    
    
    */


    async syncBookmark(bookmarks: Bookmark[]) {
        const bookmarkInsert = await this.dataService.bookmarks.syncBookmark(bookmarks)

        await this.saveBookmarkTag(bookmarkInsert);

        return bookmarkInsert
    }

    protected async saveBookmarkTag(bookmarks: Bookmark[]) {
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

        const getBookmarkTagMap = (bookmarksAndTags: BookmarkAndTag[]): BookmarkTagMap[] => {
            const bookmarkTagMap: BookmarkTagMap[] = [];
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
        const result = await this.dataService.bookmarks.attachbulk(bookmarksAndTagsMap)
        return result
    }

    async editBookmarkUrl(userId: number, bookmarkId: number, changeUrl: string) {
        let bookmark = await this.findBookmark(userId, bookmarkId);
        bookmark.url = changeUrl;
        await this.dataService.bookmarks.update(bookmarkId, bookmark)
        return { message: 'Updated' }
    }

    async deleteBookmark(userId: number, bookmarkId: number) {
        await this.findBookmark(userId, bookmarkId)
        await this.dataService.bookmarks.delete(bookmarkId)
        return { message: 'Deleted' }
    }

    async findBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
        const bookmark = await this.dataService.bookmarks.getUserBookmark(userId, bookmarkId);

        if (!bookmark) {
            throw new HttpException('Bookmark not found', HttpStatus.BAD_REQUEST)
        };

        return bookmark;
    }

}