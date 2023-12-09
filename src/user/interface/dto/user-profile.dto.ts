import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { User } from 'src/user/domain/user';
import { UserType } from 'src/user/domain/types/userType';
import { Exclude, Expose } from 'class-transformer';

export class UserProfileDto {
  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}

export class UserProfileResponseDto {
  @Exclude()
  private readonly _id: string;

  @Exclude()
  private readonly _email: string;

  @Exclude()
  private readonly _nickname: string;

  @Exclude()
  private readonly _type: UserType;

  constructor(user: User) {
    this._id = user.id;
    this._email = user.email;
    this._nickname = user.nickname;
    this._type = user.type;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get id() {
    return this._id;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get email() {
    return this._email;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get nickname() {
    return this._nickname;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get type() {
    return this._type;
  }
}
