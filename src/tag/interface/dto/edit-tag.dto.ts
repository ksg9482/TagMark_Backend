import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class EditTagDto extends PartialType(CreateTagDto) {
  @IsString()
  @ApiProperty({ description: '태그명' })
  tag: string;
}

export class EditTagResponseDto {
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
