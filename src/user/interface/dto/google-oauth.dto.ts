import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class GoogleOauthDto {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
}

export class GoogleOauthResponseDto {
  @Exclude()
  private readonly _accessToken: string;

  constructor(accessToken: string) {
    this._accessToken = accessToken;
  }

  @Expose()
  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  get accessToken() {
    return this._accessToken;
  }
}
