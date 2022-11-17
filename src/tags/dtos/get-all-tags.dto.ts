import { IsArray, IsNumber, IsObject } from "class-validator";
import { Tag } from "../entities/tag.entity";

export class GetAllTagsInputDto {
}

export class GetAllTagsOutputDto {
    @IsArray()
    tags: Tag[];
}