import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
// import { Tag } from 'src/frameworks/data-services/postgresql/model';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Tag } from 'src/tag/domain/tag';

export class GetAllTagsDto {}

export class GetAllTagsResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @IsArray()
  tags: Tag[];
}
