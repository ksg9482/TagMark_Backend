import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { Tag } from "src/core/entities";
import { BaseResponseDto } from "../common";

export class GetTagsDto {
    @ApiProperty({ description: '태그 아이디'})
    @IsArray()
    tagId: number | number[]
}

export class GetTagsResponseDto extends BaseResponseDto {
    @ApiProperty({ description: '태그 배열'})
    @IsArray()
    tags: Tag[];
}