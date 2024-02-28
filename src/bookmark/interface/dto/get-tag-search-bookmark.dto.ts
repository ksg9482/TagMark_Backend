import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { PageRequest } from 'src/bookmark/application/bookmark.pagination';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Expose } from 'class-transformer';
import { Bookmarks } from 'src/bookmark/domain/bookmarks';

export class GetSearchTagsDto extends PageRequest {}

export class GetSearchTagsResponseDto {
  readonly #totalPage: number;
  readonly #totalCount: number;
  readonly #bookmarks: Bookmarks;

  constructor(totalPage: number, totalCount: number, bookmarks: Bookmarks) {
    this.#totalPage = totalPage;
    this.#totalCount = totalCount;
    this.#bookmarks = bookmarks;
  }

  @ApiProperty({ description: '페이지네이션 페이지 수' })
  @Expose()
  get totalPage() {
    return this.#totalPage;
  }

  @ApiProperty({ description: '검색된 총 북마크 수' })
  @Expose()
  get totalCount() {
    return this.#totalCount;
  }

  @ApiProperty({ description: '검색된 북마크 배열', type: [Bookmark] })
  @Expose()
  get bookmarks() {
    return this.#bookmarks.bookmarks.map((bookmark) => {
      const tags = bookmark.tags.map((tag) => {
        return {
          id: tag.id,
          tag: tag.tag,
        };
      });
      return {
        id: bookmark.id,
        userId: bookmark.userId,
        url: bookmark.url,
        tags: tags,
      };
    });
  }
}
