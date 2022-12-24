import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsObject } from "class-validator";
import { Bookmark } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetBookmarkDto {
    @IsNumber()
    @ApiProperty({ description: '북마크 아이디'})
    bookmarkId: number
}

export class GetBookmarkResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '북마크'})
    @IsObject()
    bookmark: Bookmark;
}