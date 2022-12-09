import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { User, UserRole, UserType } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

export class PasswordValidDto {
  @IsString()
  @IsNotEmpty()
  password: string;
};

export class PasswordValidResponseDto extends BaseResponseDto {
  success: boolean;

  valid: boolean;
};
