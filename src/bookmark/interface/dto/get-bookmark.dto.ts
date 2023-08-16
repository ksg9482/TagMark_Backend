import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { Bookmark } from 'src/bookmark/domain/bookmark';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class GetBookmarkDto {
  @IsString()
  @ApiProperty({ description: '북마크 아이디' })
  bookmarkId: string;
}

export class GetBookmarkResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '북마크' })
  @IsObject()
  bookmark: Bookmark;
}
