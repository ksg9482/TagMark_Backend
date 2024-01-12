import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class DeleteBookmarkDto {}

export class DeleteBookmarkResponseDto {
  readonly #message: string;

  constructor(message: string) {
    this.#message = message;
  }

  @ApiProperty({ description: '메시지' })
  @Expose()
  get message() {
    return this.#message;
  }
}
