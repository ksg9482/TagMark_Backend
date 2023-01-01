import { IsNotEmpty, IsString } from "class-validator";
import { ResponseUser, User } from "src/frameworks/data-services/postgresql/model";
import { BaseResponseDto } from "../common/base-response.dto";

export class GoogleOauthDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string
};

export class GoogleOauthResponseDto extends BaseResponseDto {
    user: ResponseUser;
};