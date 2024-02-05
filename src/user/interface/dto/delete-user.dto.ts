import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';

export class DeleteUserDto {}

export class DeleteUserResponseDto {
  readonly #message: string;

  constructor(message: string) {
    this.#message = message;
  }

  @ApiProperty({ description: '메시지' })
  @Expose()
  get message() {
    return this.#message;
  }
}
