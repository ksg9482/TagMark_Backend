import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Tag } from 'src/tag/domain/tag';
import { Expose } from 'class-transformer';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '생성할 태그 이름' })
  tag: string;
}

export class CreateTagResponseDto {
  #id: string;
  #tag: string;

  constructor(tag: Tag) {
    this.#id = tag.id;
    this.#tag = tag.tag;
  }

  @ApiProperty({ description: '생성된' })
  @Expose()
  get id() {
    return this.#id;
  }

  @Expose()
  @ApiProperty({ description: '생성된' })
  get tag() {
    return this.#tag;
  }
}
