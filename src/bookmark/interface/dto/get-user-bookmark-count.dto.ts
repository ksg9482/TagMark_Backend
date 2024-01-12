import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class GetUserBookmarkCountDto {}

export class GetUserBookmarkCountResponseDto {
  readonly #count: number;

  constructor(count: number) {
    this.#count = count;
  }
  @ApiProperty({ description: '유저의 전체 북마크 수' })
  @Expose()
  get count() {
    return this.#count;
  }
}
