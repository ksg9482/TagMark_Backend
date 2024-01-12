import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { PageRequest } from 'src/bookmark/application/bookmark.pagination';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Expose } from 'class-transformer';

export class GetSearchTagsDto extends PageRequest {}

export class GetSearchTagsResponseDto {
  readonly #totalPage: number;
  readonly #totalCount: number;
  readonly #bookmarks: Bookmark[];

  constructor(totalPage: number, totalCount: number, bookmarks: Bookmark[]) {
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
    return this.#bookmarks;
  }
}
