import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { UserProfileOutputDto } from "./user-profile.dto";

export class SignUpInputDto {
    @IsEmail()
    @ApiProperty({ description: '이메일'})
    email: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ description: '비밀번호',minimum:8})
    password: string;

    @IsString()
    @ApiProperty({ description: '별명'})
    nickname: string;
}

export class SignUpOutputDto extends UserProfileOutputDto{}