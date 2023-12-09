import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
export class LoginDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @IsNotEmpty()
  readonly password: string;
}

export class LoginResponseDto {
  @Exclude()
  private readonly _accessToken: string;

  constructor(accessToken: string) {
    this._accessToken = accessToken;
  }

  @Expose()
  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  get accessToken() {
    return this._accessToken;
  }
}
