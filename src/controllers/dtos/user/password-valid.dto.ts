import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { User, UserRole, UserType } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

export class PasswordValidDto {
  @ApiProperty({ description: '비밀번호'})
  @IsString()
  //@Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @IsNotEmpty()
  password: string;
};

export class PasswordValidResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '비밀번호 정합여부'})
  @IsBoolean()
  valid: boolean;
};
