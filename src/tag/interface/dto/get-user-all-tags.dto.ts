import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Tag } from 'src/tag/domain/tag';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { TagWithCount } from 'src/tag/domain/tag.interface';

export class GetUserAllTagsDto {}

export class GetUserAllTagsResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @IsArray()
  tags: TagWithCount[];
}
