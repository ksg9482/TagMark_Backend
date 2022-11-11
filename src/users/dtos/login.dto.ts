import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { UserProfileOutputDto } from "./user-profile.dto";

export class LoginInputDto {
    @IsEmail()
    @ApiProperty({ description: '이메일'})
    email: string;

    @IsString()
    @ApiProperty({ description: '비밀번호'})
    password: string;
}

export class LoginOutputDto extends UserProfileOutputDto{
    @IsString()
    accessToken:string;

    @IsString()
    refreshToken:string;
}