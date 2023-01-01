import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { ResponseUser, User } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class CreateUserDto {
  @ApiProperty({ description: '이메일'})
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호'})
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '별명'})
  @IsString()
  @IsOptional()
  nickname?: string;
};

export class CreateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 유저 데이터'})
  @IsObject()
  createdUser: ResponseUser;
};
