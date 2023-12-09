import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/user/domain';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
export class EditUserDto {
  @ApiProperty({ description: '변경하려는 비밀번호' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  readonly password: string;

  @ApiProperty({ description: '변경하려는 닉네임' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(20)
  readonly nickname: string;
}

export class EditUserResponseDto {
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
