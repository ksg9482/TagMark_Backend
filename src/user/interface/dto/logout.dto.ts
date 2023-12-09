import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/domain';
export class LogoutDto {}

export class LogoutResponseDto {
  @Exclude()
  private _id: string;

  constructor(user: Pick<User, 'id'>) {
    this._id = user.id;
  }

  @Expose()
  @ApiProperty({ description: '생성된 유저 아이디' })
  get id() {
    return this._id;
  }
}
