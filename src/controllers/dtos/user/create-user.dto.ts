import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { ResponseUser, User } from "src/frameworks/data-services/postgresql/model";
//import { User, UserRole, UserType } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

//걸리는점: 이 DTO는 CORE계층에 있는데 여기엔 추상만 쓰고 실제 구현은 프레임워크 계층에 넣는데 좋지 않을까?
//controller -> usecase -> dataservice(이게 리포지토리. 서비스는 추상화된 DB결과를 받고, 실제 DB연결도 추상화된 결과에 맞게 보내준다) <- 실제 DB연결
export class CreateUserDto {
  @ApiProperty({ description: '이메일'})
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호'})
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '별명'})
  @IsString()
  @IsOptional()
  nickname?: string;

  // role: UserRole;

  // type: UserType;
};

export class CreateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ description: '생성된 유저 데이터'})
  @IsObject()
  createdUser: ResponseUser;
};
