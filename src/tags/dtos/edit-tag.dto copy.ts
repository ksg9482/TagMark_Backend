import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

import { TagOutputDto } from "./tag.dto";


export class EditTagInputDto {
    @IsString()
    @ApiProperty({ description: '태그명'})
    changeTag: string;

}

export class EditTagOutputDto extends PartialType(TagOutputDto) {}