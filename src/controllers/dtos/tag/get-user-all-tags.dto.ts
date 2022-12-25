import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Tag } from "src/frameworks/data-services/postgresql/model";
//import { Bookmark, Tag } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetUserAllTagsDto {
}

export class GetUserAllTagsResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '태그 배열', type:[Tag]})
    @IsArray()
    tags: Tag[];
}