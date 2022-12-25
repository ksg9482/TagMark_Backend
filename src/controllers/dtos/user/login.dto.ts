import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { ResponseUser, User } from "src/frameworks/data-services/postgresql/model";
//import { User } from "src/core/entities";
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
    @ApiProperty({ description: '유저 데이터'})
    //이거 정리해야 됨
    user: ResponseUser

    @ApiProperty({ description: 'JWT 액세스 토큰'})
    @IsString()
    accessToken: string;

    @ApiProperty({ description: 'JWT 리프레시 토큰'})
    @IsString()
    refreshToken: string;
};