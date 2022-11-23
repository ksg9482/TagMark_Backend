import { IsOptional, IsString, MinLength } from "class-validator";
import { BaseResponseDto } from "../common/base-response.dto";

export class EditUserDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    changePassword: string;

    @IsString()
    @IsOptional()
    @MinLength(1)
    changeNickname: string;
};

//메시지? 바뀐 유저 데이터? 비번 안보내는거 고려하면 메시지가 나을지도?
export class EditUserResponseDto extends BaseResponseDto {
    success: boolean;
};