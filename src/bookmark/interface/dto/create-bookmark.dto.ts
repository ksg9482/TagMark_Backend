import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { Tags } from 'src/tag/domain/tags';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL ' })
  url: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '태그 문자열로 이루어진 배열. 생성시 입력되지 않을 수 있다.',
  })
  tagNames?: string[];
}

export class CreateBookmarkResponseDto {
  readonly #id: string;
  readonly #userId: string;
  readonly #url: string;
  readonly #tags: Tags;

  constructor(bookmark: Bookmark) {
    this.#id = bookmark.id;
    this.#userId = bookmark.userId;
    this.#url = bookmark.url;
    this.#tags = new Tags(bookmark.tags);
  }

  @ApiProperty({ description: '생성된 북마크 id' })
  @Expose()
  get id() {
    return this.#id;
  }

  @ApiProperty({ description: '생성된 북마크 유저 id' })
  @Expose()
  get userId() {
    return this.#userId;
  }

  @ApiProperty({ description: '생성된 북마크 url' })
  @Expose()
  get url() {
    return this.#url;
  }

  @ApiProperty({ description: '생성된 북마크 태그 리스트' })
  @Expose()
  get tags() {
    return this.#tags.tags.map((tag) => {
      return { id: tag.id, tag: tag.tag };
    });
  }
}
