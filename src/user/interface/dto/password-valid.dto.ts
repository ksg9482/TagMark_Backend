import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class PasswordValidDto {
  private _password: string;

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

export class PasswordValidResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '비밀번호 정합여부' })
  @IsBoolean()
  valid: boolean;
}
