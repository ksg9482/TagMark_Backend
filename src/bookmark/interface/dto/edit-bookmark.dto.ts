import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBookmarkDto } from './create-bookmark.dto';

export class EditBookmarkDto extends OmitType(CreateBookmarkDto, ['tagNames']) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '변경할 URL' })
  url: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '삭제할 태그 아이디 배열. 해당 태그의 id를 알고있는 상태.',
    type: ['string'],
  })
  deleteTag: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '태그 이름 배열. DB에 해당 태그가 있는지 모른다.',
  })
  addTag: string[];
}

export class EditBookmarkResponseDto {
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
