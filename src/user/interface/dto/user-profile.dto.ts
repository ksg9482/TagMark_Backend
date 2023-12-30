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
  readonly #id: string;

  readonly #email: string;

  readonly #nickname: string;

  readonly #type: UserType;

  constructor(user: User) {
    this.#id = user.id;
    this.#email = user.email;
    this.#nickname = user.nickname;
    this.#type = user.type;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get id() {
    return this.#id;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get email() {
    return this.#email;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get nickname() {
    return this.#nickname;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get type() {
    return this.#type;
  }
}
