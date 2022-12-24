import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Bookmark, Tag } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetUserAllTagsDto {
}

export class GetUserAllTagsResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '태그 배열'})
    @IsArray()
    tags: Tag[];
}