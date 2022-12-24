import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Bookmark } from "src/core/entities";
import { PageRequest } from "src/use-cases/bookmark/bookmark.pagination";
import { BaseResponseDto } from "../common";

export class GetUserAllBookmarksDto extends PageRequest {}

export class GetUserAllBookmarksResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '페이지네이션 페이지 수'})
    @IsNumber()
    totalPage:number;

    @ApiProperty({ description: '총 북마크 수'})
    @IsNumber()
    totalCount:number;

    @ApiProperty({ description: '북마크 배열'})
    @IsArray()
    bookmarks:Bookmark[];
}