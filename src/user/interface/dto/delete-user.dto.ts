import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';

export class DeleteUserDto {}

export class DeleteUserResponseDto {
  #id: string;

  constructor(user: Pick<User, 'id'>) {
    this.#id = user.id;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get id() {
    return this.#id;
  }
}
