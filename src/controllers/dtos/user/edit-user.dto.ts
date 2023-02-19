import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { BaseResponseDto } from "../common/base-response.dto";

export class EditUserDto {
    @ApiProperty({ description: '변경하려는 비밀번호'})
    @IsString()
    @IsOptional()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
    changePassword: string;

    @ApiProperty({ description: '변경하려는 닉네임'})
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(20)
    changeNickname: string;
};

export class EditUserResponseDto extends BaseResponseDto {
};