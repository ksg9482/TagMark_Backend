import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { Bookmark } from "src/core/entities";
import { PageRequest } from "src/use-cases/bookmark/bookmark.pagination";
import { BaseResponseDto } from "../common";

export class GetUserAllBookmarksDto extends PageRequest {}

export class GetUserAllBookmarksResponseDto extends BaseResponseDto {
    totalPage:number;
    totalCount:number;
    bookmarks:Bookmark[];
}