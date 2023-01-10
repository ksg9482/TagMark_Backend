import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsObject, IsString, Matches } from "class-validator";
import { ResponseUser } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class LoginDto {
    @ApiProperty({ description: '이메일'})
    //@IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: '비밀번호'})
    @IsString()
    //@Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
    @IsNotEmpty()
    password: string;
};

export class LoginResponseDto extends BaseResponseDto {
    @IsObject()
    @ApiProperty({ description: '유저 데이터'})
    user: ResponseUser

    @IsString()
    @ApiProperty({ description: 'JWT 액세스 토큰'})
    accessToken: string;

};