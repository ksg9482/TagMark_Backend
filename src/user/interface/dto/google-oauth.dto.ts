import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { User } from 'src/user/domain';
import { ResponseUser } from 'src/user/infra/db/entity/user.entity';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class GoogleOauthDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class GoogleOauthResponseDto extends BaseResponseDto {
  @IsObject()
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;

  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;
}
