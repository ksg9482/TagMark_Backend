import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/cleanArchitecture/common/dto/base-response.dto';

export class DeleteTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '삭제할 태그가 있는 북마크 id' })
  bookmarkId: string;
}

export class DeleteTagResponseDto extends BaseResponseDto {}
