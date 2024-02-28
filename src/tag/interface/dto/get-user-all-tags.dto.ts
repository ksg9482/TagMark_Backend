import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Tag } from 'src/tag/domain/tag';
import { TagWithCounts } from 'src/tag/domain/tag.interface';

export class GetUserAllTagsDto {}

export class GetUserAllTagsResponseDto {
  #tagWithCounts: TagWithCounts;

  constructor(tagWithCounts: TagWithCounts) {
    this.#tagWithCounts = tagWithCounts;
  }

  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @Expose()
  get tagWithCounts() {
    return this.#tagWithCounts.tagWithCounts;
  }
}
