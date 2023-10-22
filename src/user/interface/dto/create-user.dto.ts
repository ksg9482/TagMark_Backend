import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';

export class CreateUserDto {
  private _email: string;
  private _password: string;
  private _nickname?: string;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
  @MaxLength(60)
  @IsNotEmpty()
  get email() {
    return this._email;
  }

  set email(value) {
    this._email = value;
  }

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @MinLength(6)
  @IsNotEmpty()
  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }

  @ApiProperty({ description: '별명' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  get nickname() {
    return this._nickname;
  }

  set nickname(value) {
    this._nickname = value;
  }
}

export class CreateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 유저 데이터' })
  @IsObject()
  createdUser: Partial<User>;
}
