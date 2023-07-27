import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/cleanArchitecture/common/dto/base-response.dto';

export class EditBookmarkDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '변경할 URL' })
  changeUrl: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '삭제할 태그 아이디 배열. 해당 태그의 id를 알고있는 상태.',
    type: ['number'],
  })
  deleteTag: number[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '태그 이름 배열. DB에 해당 태그가 있는지 모른다.',
  })
  addTag: string[];
}

export class EditBookmarkResponseDto extends BaseResponseDto {}
