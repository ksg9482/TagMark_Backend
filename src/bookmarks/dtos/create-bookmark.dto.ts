import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Tag } from "src/tags/entities/tag.entity";

import { BookmarkOutputDto } from "./bookmark.dto";

export class CreateBookmarkInputDto {
    @IsString()
    @ApiProperty({ description: 'URL '})
    url: string;

    //@IsString()
    @IsArray()
    @IsOptional()
    @ApiProperty({ description: '태그들'})
    tags: Tag[];
}

export class CreateBookmarkOutputDto extends PartialType(BookmarkOutputDto) {}