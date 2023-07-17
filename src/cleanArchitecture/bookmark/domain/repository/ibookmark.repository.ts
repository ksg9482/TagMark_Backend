import { Page } from "src/use-cases/bookmark/bookmark.pagination";
import { Bookmark } from "src/cleanArchitecture/bookmark/domain/bookmark";

export interface IBookmarkRepository {
    getUserBookmark: (userId: number, bookmarkId:number) => Promise<Bookmark | null>,
    getBookmarkByUrl: (url:string) => Promise<Bookmark | null>,
    getUserAllBookmarks: (userId:number, page:any) => Promise<Page<Bookmark>>,
    getcount: (userId: number) =>Promise<any>,
    syncBookmark: (bookmarks:Bookmark[]) => Promise<Bookmark[]>,
    attachbulk: (BookmarkTagMap:any) => Promise<any>
}
