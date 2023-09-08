import { UserRole, UserType } from 'src/user/domain';
export class User {
  nickname: string;
  password: string;
  role: UserRole;
  type: UserType;
  constructor(
  readonly id: string, //uuid
  readonly email: string,
  nickname: string,
  password: string,
  role: UserRole,
  type: UserType,
  ) {
    this.nickname = nickname;
    this.password = password;
    this.role = role;
    this.type = type;
  }
}

export interface ResponseUser {
  id: string;
  email: string;
  nickname: string;
}
