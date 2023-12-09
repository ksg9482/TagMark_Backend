import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class PasswordValidDto {
  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @IsNotEmpty()
  readonly password: string;
}

export class PasswordValidResponseDto {
  private readonly _valid: boolean;

  constructor(valid: boolean) {
    this._valid = valid;
  }

  @ApiProperty({ description: '비밀번호 정합여부' })
  @IsBoolean()
  get valid() {
    return this._valid;
  }
}
