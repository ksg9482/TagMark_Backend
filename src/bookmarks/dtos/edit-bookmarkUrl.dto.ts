import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Tag } from "src/tags/entities/tag.entity";

import { BookmarkOutputDto } from "./bookmark.dto";

export class EditBookmarkUrlInputDto {
    @IsString()
    //@ApiProperty({ description: '태그들'})
    changeUrl: string;
}

export class EditBookmarkUrlOutputDto {}