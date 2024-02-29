import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
export class RefreshTokenDto {}

export class RefreshTokenResponseDto {
  readonly #accessToken: string;
  constructor(accessToken: string) {
    this.#accessToken = accessToken;
  }

  @ApiProperty({ description: '새로운 JWT 액세스 토큰' })
  @IsString()
  @Expose()
  get accessToken() {
    return this.#accessToken;
  }
}
