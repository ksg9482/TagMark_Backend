import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { User } from 'src/user/domain/user';

export class UserProfileDto {
  private _userId: string;

  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  get userId() {
    return this._userId;
  }

  set userId(value) {
    this._userId = value;
  }
}

export class UserProfileResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '유저 데이터' })
  user: Partial<User>;
}
