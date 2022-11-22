import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { User, UserRole, UserType } from "src/core/entities";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  nickname: string;


  role: UserRole;


  type: UserType;
};

export class CreateUserResponseDto {
  success: boolean;

  createdUser: User;
};
