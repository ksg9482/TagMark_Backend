import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleOauthDto {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
}

export class GoogleOauthResponseDto {
  readonly #accessToken: string;

  constructor(accessToken: string) {
    this.#accessToken = accessToken;
  }

  @Expose()
  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  get accessToken() {
    return this.#accessToken;
  }
}
