import { IsNumber, IsObject } from "class-validator";
import { Tag } from "../entities/tag.entity";

export class TagInputDto {
    @IsNumber()
    tagId: number
}

export class TagOutputDto {
    @IsObject()
    tag: Tag;
}