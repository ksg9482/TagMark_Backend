import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { User, UserRole, UserType } from "../entities";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    nickname: string;

    
    role: UserRole;

    
    type: UserType;

    // @IsDate()
    // createdAt: Date;

    // @IsDate()
    // updatedAt: Date;
};

export class CreateUserResponseDto {
    success: boolean;
  
    createdUser: User;
  }
  

export class EditUserDto extends PartialType(CreateUserDto){}