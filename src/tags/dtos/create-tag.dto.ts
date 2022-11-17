import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { TagOutputDto } from "./tag.dto";


export class CreateTagInputDto {
    @IsString()
    @ApiProperty({ description: '태그명'})
    tag: string;
}

export class CreateTagOutputDto extends PartialType(TagOutputDto) {}