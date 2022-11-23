import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Bookmark, Tag } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL '})
  url: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ description: '태그 문자열로 이루어진 배열'})
  tags: string[];
};

export class CreateBookmarkResponseDto extends BaseResponseDto {
  createdBookmark: Bookmark;
};
