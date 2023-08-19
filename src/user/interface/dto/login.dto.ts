import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
} from 'class-validator';
import { User } from 'src/user/domain';
import { ResponseUser } from 'src/user/infra/db/entity/user.entity';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class LoginDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto extends BaseResponseDto {
  @IsObject()
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;

  @IsString()
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;
}
