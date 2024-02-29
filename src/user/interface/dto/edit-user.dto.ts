import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditUserDto {
  @ApiProperty({ description: '변경하려는 비밀번호' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  readonly password: string;

  @ApiProperty({ description: '변경하려는 닉네임' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(20)
  readonly nickname: string;
}

export class EditUserResponseDto {
  readonly #message: string;

  constructor(message: string) {
    this.#message = message;
  }

  @ApiProperty({ description: '메시지' })
  @Expose()
  get message() {
    return this.#message;
  }
}
