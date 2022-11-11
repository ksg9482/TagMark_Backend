import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

import { UserProfileOutputDto } from "./user-profile.dto";

export class SignUpInputDto {
    @IsEmail()
    @ApiProperty({ description: '이메일'})
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ description: '비밀번호',minimum:6})
    password: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: '별명'})
    nickname: string;
}

export class SignUpOutputDto extends UserProfileOutputDto{}