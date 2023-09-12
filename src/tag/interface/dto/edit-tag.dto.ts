import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateTagDto } from './create-tag.dto';

export class EditTagDto extends PartialType(CreateTagDto) {
  @IsString()
  @ApiProperty({ description: '태그명' })
  tag: string;
}

export class EditTagResponseDto extends BaseResponseDto {}
