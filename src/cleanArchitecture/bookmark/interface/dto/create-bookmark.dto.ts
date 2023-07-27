import { PartialType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { BaseResponseDto } from 'src/cleanArchitecture/common/dto/base-response.dto';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL ' })
  url: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '태그 문자열로 이루어진 배열. 생성시 입력되지 않을 수 있다.',
  })
  tagNames?: string[];
}

export class CreateBookmarkResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 북마크' })
  @IsObject()
  createdBookmark: Bookmark;
}
