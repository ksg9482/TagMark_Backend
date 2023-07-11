import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ResponseUser } from 'src/frameworks/data-services/postgresql/model';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
export class GoogleOauthDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class GoogleOauthResponseDto extends BaseResponseDto {
  @IsObject()
  @ApiProperty({ description: '유저 데이터' })
  user: ResponseUser;

  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;
}
