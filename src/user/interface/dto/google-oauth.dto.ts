import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class GoogleOauthDto {
  private _accessToken: string;

  @IsString()
  @IsNotEmpty()
  get accessToken() {
    return this._accessToken;
  }

  set accessToken(value) {
    this._accessToken = value;
  }
}

export class GoogleOauthResponseDto extends BaseResponseDto {
  @IsObject()
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;

  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;
}
