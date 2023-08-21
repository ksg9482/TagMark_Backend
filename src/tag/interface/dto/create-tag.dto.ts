import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Tag } from 'src/tag/domain/tag';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '생성할 태그 이름' })
  tag: string;
}

export class CreateTagResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 태그' })
  createdTag: Tag;
}
