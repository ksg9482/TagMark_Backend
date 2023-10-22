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
  private _password?: string;
  private _nickname?: string;

  @ApiProperty({ description: '변경하려는 비밀번호' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }

  @ApiProperty({ description: '변경하려는 닉네임' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(20)
  get nickname() {
    return this._nickname;
  }

  set nickname(value) {
    this._nickname = value;
  }
}

export class EditUserResponseDto extends BaseResponseDto {}
