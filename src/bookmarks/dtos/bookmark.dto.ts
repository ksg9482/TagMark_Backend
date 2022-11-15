import { IsNumber, IsObject } from "class-validator";
import { Bookmark } from "../entities/bookmark.entity";

export class BookmarkInputDto {
    @IsNumber()
    bookmarkId: number
}

export class BookmarkOutputDto {
    @IsObject()
    bookmark: Bookmark;
}