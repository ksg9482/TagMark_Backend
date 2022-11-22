import { IsNotEmpty, IsString } from "class-validator";
import { User } from "src/core/entities";

export class GoogleOauthDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string
};

export class GoogleOauthResponseDto {
    success: boolean;

    user: User;
};