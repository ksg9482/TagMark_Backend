import { IsNumber, IsObject } from "class-validator";
import { Bookmark } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetBookmarkDto {
    @IsNumber()
    bookmarkId: number
}

export class GetBookmarkResponseDto extends BaseResponseDto {
    bookmark: Bookmark;
}