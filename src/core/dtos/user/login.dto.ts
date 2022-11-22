import { IsNotEmpty, IsString } from "class-validator";
import { User } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
};

export class LoginResponseDto extends BaseResponseDto {
    user: User

    accessToken: string;

    refreshToken: string;
};