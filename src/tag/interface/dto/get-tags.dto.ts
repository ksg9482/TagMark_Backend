import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Tag } from 'src/frameworks/data-services/postgresql/model';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class GetTagsDto {
  @ApiProperty({ description: '태그 아이디' })
  @IsArray()
  tagId: string | string[];
}

export class GetTagsResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @IsArray()
  tags: Tag[];
}
