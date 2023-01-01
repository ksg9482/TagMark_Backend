import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional } from "class-validator";
import { Bookmark } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class SyncBookmarkDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: '북마크 배열'})
  bookmarks: Bookmark[];

  @IsArray()
  @IsOptional()
  @ApiProperty({ description: '태그 이름 배열'})
  tagNames: string[];
};

export class SyncBookmarkResponseDto extends BaseResponseDto {
  bookmarks: Bookmark[];
};
