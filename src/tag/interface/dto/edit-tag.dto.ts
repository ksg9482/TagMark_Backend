import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class EditTagDto {
  @IsString()
  @ApiProperty({ description: '태그명' })
  changeTag: string;
}

export class EditTagResponseDto extends BaseResponseDto {}
