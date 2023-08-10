import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { PageRequest } from 'src/cleanArchitecture/bookmark/application/bookmark.pagination';
import { BaseResponseDto } from 'src/cleanArchitecture/common/dto/base-response.dto';

export class GetSearchTagsDto extends PageRequest {}

export class GetSearchTagsResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '페이지네이션 페이지 수' })
  @IsNumber()
  totalPage: number;

  @ApiProperty({ description: '검색된 총 북마크 수' })
  @IsNumber()
  totalCount: number;

  @ApiProperty({ description: '검색된 북마크 배열', type: [Bookmark] })
  @IsArray()
  bookmarks: Bookmark[];
}