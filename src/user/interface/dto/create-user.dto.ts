import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/user/domain';

export class CreateUserDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  @MaxLength(60)
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: '별명' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  readonly nickname?: string;
}

export class CreateUserResponseDto {
  #id: string;

  constructor(user: Pick<User, 'id'>) {
    this.#id = user.id;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get id() {
    return this.#id;
  }
}
