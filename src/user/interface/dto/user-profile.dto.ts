import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { User } from 'src/user/domain/user';

export class UserProfileDto {
  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UserProfileResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;
}
