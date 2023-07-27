import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Tag } from 'src/frameworks/data-services/postgresql/model';
import { BaseResponseDto } from 'src/cleanArchitecture/common/dto/base-response.dto';

export class GetUserAllTagsDto {}

export class GetUserAllTagsResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '태그 배열', type: [Tag] })
  @IsArray()
  tags: Tag[];
}
