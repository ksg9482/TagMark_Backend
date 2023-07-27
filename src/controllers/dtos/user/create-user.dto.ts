import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ResponseUser, User } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class CreateUserDto {
  @ApiProperty({ description: '이메일'})
  @IsEmail()
  @MaxLength(60)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호'})
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '별명'})
  @IsString()
  @MaxLength(20)
  @IsOptional()
  nickname?: string;
};

export class CreateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 유저 데이터'})
  @IsObject()
  createdUser: ResponseUser;
};
