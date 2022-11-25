import { IsArray } from "class-validator";
import { Tag } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetTagsDto {
    @IsArray()
    tagId: number | number[]
}

export class GetTagsResponseDto extends BaseResponseDto {
    tags: Tag[];
}