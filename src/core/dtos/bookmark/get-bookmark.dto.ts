import { IsNumber, IsObject } from "class-validator";
import { Bookmark } from "src/core/entities";

export class GetBookmarkDto {
    @IsNumber()
    bookmarkId: number
}

export class GetBookmarkResponseDto {
    @IsObject()
    bookmark: Bookmark;
}