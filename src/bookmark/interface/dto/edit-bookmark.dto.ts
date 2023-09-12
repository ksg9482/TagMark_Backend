import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateBookmarkDto } from './create-bookmark.dto';

export class EditBookmarkDto extends PartialType(CreateBookmarkDto) {
  @IsString()
  @IsOptional()
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

export class EditBookmarkResponseDto extends BaseResponseDto {}
