import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ResponseUser } from 'src/frameworks/data-services/postgresql/model';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
export class UserProfileDto {
  @ApiProperty({ description: '유저 아이디' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class UserProfileResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '유저 데이터' })
  user: ResponseUser;
}
