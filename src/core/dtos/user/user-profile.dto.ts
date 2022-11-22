import { IsNotEmpty, IsNumber, IsObject } from "class-validator";
import { User } from "src/core/entities";


export class UserProfileDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number
}

export class UserProfileResponseDto {
    success: boolean;

    user: User;
}