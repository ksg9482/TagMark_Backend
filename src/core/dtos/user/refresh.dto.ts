import { BaseResponseDto } from "../common/base-response.dto";

export class RefreshTokenDto {

};

export class RefreshTokenResponseDto extends BaseResponseDto {
    success: boolean;

    accessToken: string;
};