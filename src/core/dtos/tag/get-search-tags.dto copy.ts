import { IsArray } from "class-validator";
import { Bookmark } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetSearchTagsDto {
}

export class GetSearchTagsResponseDto extends BaseResponseDto {
    bookmarks: Bookmark[];
}