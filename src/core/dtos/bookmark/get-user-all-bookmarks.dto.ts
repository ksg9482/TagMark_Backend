import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { Bookmark } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetUserAllBookmarksDto {
}

export class GetUserAllBookmarksResponseDto extends BaseResponseDto {
    bookmarks:Bookmark[]
}