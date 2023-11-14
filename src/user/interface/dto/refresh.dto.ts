import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class RefreshTokenDto {}

export class RefreshTokenResponseDto extends BaseResponseDto {

  @Exclude() private readonly _accessToken: string;
  constructor( accessToken: string ) {
    super()
    this._accessToken = accessToken
  }

  @ApiProperty({ description: '새로운 JWT 액세스 토큰' })
  @IsString()
  @Expose()
  get accessToken () {
    return this._accessToken
  }
}
