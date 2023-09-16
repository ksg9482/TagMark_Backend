import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { CreateUserDto } from './create-user.dto';
export class EditUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: '변경하려는 비밀번호' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  password?: string;

  @ApiProperty({ description: '변경하려는 닉네임' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(20)
  nickname?: string;
}

export class EditUserResponseDto extends BaseResponseDto {}
