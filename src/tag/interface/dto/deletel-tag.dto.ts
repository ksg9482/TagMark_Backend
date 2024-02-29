import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '삭제할 태그가 있는 북마크 id' })
  bookmarkId: string;
}

export class DeleteTagResponseDto {
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
