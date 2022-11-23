import { IsNotEmpty, IsNumber, IsObject } from "class-validator";
import { User } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";


export class UserProfileDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number
}

export class UserProfileResponseDto extends BaseResponseDto {
    success: boolean;

    user: User;
}