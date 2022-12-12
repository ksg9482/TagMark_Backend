import { IsArray } from "class-validator";
import { Bookmark } from "src/core/entities";
import { PageRequest } from "src/use-cases/bookmark/bookmark.pagination";
import { BaseResponseDto } from "../common";

export class GetSearchTagsDto extends PageRequest {}

export class GetSearchTagsResponseDto extends BaseResponseDto {
    totalPage:number;
    totalCount:number;
    bookmarks: Bookmark[];
}