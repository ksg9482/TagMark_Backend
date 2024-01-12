import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class SyncBookmarkDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: '북마크 배열' })
  bookmarks: Bookmark[];

  @IsArray()
  @IsOptional()
  @ApiProperty({ description: '태그 이름 배열' })
  tagNames?: string[];
}

export class SyncBookmarkResponseDto {
  readonly #message: string;
  readonly #bookmarks: Bookmark[];

  constructor(message: string, bookmarks: Bookmark[]) {
    this.#message = message;
    this.#bookmarks = bookmarks;
  }

  @ApiProperty({ description: '메시지' })
  @Expose()
  get message() {
    return this.#message;
  }

  @ApiProperty({ description: '북마크 배열' })
  @Expose()
  get bookmarks() {
    return this.#bookmarks.map((bookmark) => {
      return {
        id: bookmark.id,
        userId: bookmark.userId,
        url: bookmark.url,
        tags: bookmark.tags,
      };
    });
  }
}
