import { IsArray, IsNumber, IsObject } from "class-validator";
import { Tag } from "../entities/tag.entity";

export class GetTagsInputDto {
    //@IsNumber()
    @IsArray()
    tagId: number | number[]
}

export class GetTagsOutputDto {
    @IsArray()
    tags: Tag[];
}