import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class RefreshTokenDto {}

export class RefreshTokenResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '새로운 JWT 액세스 토큰' })
  @IsString()
  accessToken: string;
}
