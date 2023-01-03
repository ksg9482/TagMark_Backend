import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { ResponseUser } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class LoginDto {
    @ApiProperty({ description: '이메일'})
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: '비밀번호'})
    @IsString()
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