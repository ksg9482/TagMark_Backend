import { Page } from "src/use-cases/bookmark/bookmark.pagination";
import { QueryRunner, SelectQueryBuilder } from "typeorm";
import { Bookmark } from "../entities";
import { GenericRepository } from "./generic-repository.abstract";

export abstract class BookmarkRepository extends GenericRepository<Bookmark> {
    abstract getUserBookmark(userId: number, bookmarkId:number): Promise<Bookmark>
    abstract getBookmarkByUrl(url:string): Promise<Bookmark>
    abstract getUserAllBookmarks(userId:number, page:any): Promise<Page<Bookmark>>
    abstract getcount(userId: number):Promise<any>
}