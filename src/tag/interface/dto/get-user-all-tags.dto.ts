import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';
import { Tag } from 'src/tag/domain/tag';
import { TagWithCount } from 'src/tag/domain/tag.interface';

export class GetUserAllTagsDto {}

export class GetUserAllTagsResponseDto {
  #tagWithCounts: TagWithCount[];

  constructor(tagWithCounts: TagWithCount[]) {
    this.#tagWithCounts = tagWithCounts;
  }

  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @Expose()
  get tagWithCounts() {
    return this.#tagWithCounts;
  }
}
