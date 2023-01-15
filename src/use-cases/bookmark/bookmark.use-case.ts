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
        const bookmark = await this.bookmarkCheck(url)
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

    

    async getUserBookmarkCount(userId: number) {
        const { count } = await this.dataService.bookmarks.getcount(userId)
        return count
    }

    async syncBookmark(bookmarks: Bookmark[]) {
        const bookmarkInsert = await this.dataService.bookmarks.syncBookmark(bookmarks)

        await this.saveBookmarkTag(bookmarkInsert);

        return bookmarkInsert
    }

    

    async editBookmarkUrl(userId: number, bookmarkId: number, changeUrl: string) {
        let bookmark = await this.findBookmark(userId, bookmarkId);
        bookmark.url = changeUrl;
        await this.dataService.bookmarks.update(bookmarkId, bookmark);

        return { message: 'Updated' };
    };

    async deleteBookmark(userId: number, bookmarkId: number) {
        await this.findBookmark(userId, bookmarkId);
        await this.dataService.bookmarks.delete(bookmarkId);

        return { message: 'Deleted' };
    };

    async findBookmark(userId: number, bookmarkId: number): Promise<Bookmark> {
        const bookmark = await this.dataService.bookmarks.getUserBookmark(userId, bookmarkId);

        if (!bookmark) {
            throw new HttpException('Bookmark not found', HttpStatus.BAD_REQUEST)
        };

        return bookmark;
    };

    protected async bookmarkCheck(url:string) {
        const bookmark = await this.dataService.bookmarks.getBookmarkByUrl(url);
        
        return bookmark;
    };

    protected bookmarksNullCheck(bookmarks: Bookmark[]) {
        const result = bookmarks.map((bookmark) => {
            if (!bookmark.tags[0]) {
                bookmark.tags = null;
            };
            return bookmark;
        });
        return result;
    };

    protected async saveBookmarkTag(bookmarks: Bookmark[]) {
        const bookmarksAndTags = this.getBookmarkIdAndTagId(bookmarks);
        const bookmarksAndTagsMap = this.getBookmarkTagMap(bookmarksAndTags);
        
        const result = await this.dataService.bookmarks.attachbulk(bookmarksAndTagsMap)
        
        return result
    }

    protected getBookmarkIdAndTagId(bookmarks: Bookmark[]) {
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
    }

    protected getBookmarkTagMap(bookmarksAndTags: BookmarkAndTag[]) {
        const bookmarkTagMap: BookmarkTagMap[] = [];
        for (let bookmarksTags of bookmarksAndTags) {
            for (let tagId of bookmarksTags.tagIds) {
                bookmarkTagMap.push(
                    {
                        bookmarkId: bookmarksTags.bookmarkId,
                        tagId: tagId
                    }
                );
            };
        };
        return bookmarkTagMap;
    }
}