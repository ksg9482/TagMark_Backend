import { IsOptional, IsString } from "class-validator";

export class EditUserDto {
    @IsString()
    @IsOptional()
    changePassword: string;

    @IsString()
    @IsOptional()
    changeNickname: string;
};

//메시지? 바뀐 유저 데이터? 비번 안보내는거 고려하면 메시지가 나을지도?
export class EditUserResponseDto {
    success: boolean;
};