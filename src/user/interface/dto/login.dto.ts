import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
} from 'class-validator';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class LoginDto {
  private _email: string;
  private _password: string;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
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
  @IsNotEmpty()
  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }
}

export class LoginResponseDto extends BaseResponseDto {
  @IsObject()
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;

  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;
}
