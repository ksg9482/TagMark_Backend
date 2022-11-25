import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { Bookmark, Tag } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetAllTagsDto {
}

export class GetAllTagsResponseDto extends BaseResponseDto {
    tags: Tag[];
}