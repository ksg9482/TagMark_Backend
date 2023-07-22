import { Page } from "src/use-cases/bookmark/bookmark.pagination";
import { Bookmark } from "src/cleanArchitecture/bookmark/domain/bookmark";
import { IGenericRepository } from "src/cleanArchitecture/common/domain/repository/igeneric-repository";

export interface IBookmarkRepository extends IGenericRepository<Bookmark> {
    getUserBookmark: (userId: string, bookmarkId:string) => Promise<Bookmark | null>,
    getBookmarkByUrl: (url:string) => Promise<Bookmark | null>,
    getUserAllBookmarks: (userId:string, page:any) => Promise<Page<Bookmark>>,
    getcount: (userId: string) =>Promise<any>,
    syncBookmark: (bookmarks:Bookmark[]) => Promise<Bookmark[]>,
    attachbulk: (BookmarkTagMap:any) => Promise<any>
}
