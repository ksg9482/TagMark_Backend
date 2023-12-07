import { Injectable } from '@nestjs/common';
import { User } from 'src/user/domain/user';
import { UserRole } from './types/userRole';
import { UserType } from './types/userType';

@Injectable()
export class UserFactory {
  create(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): User {
    if (nickname === undefined) {
      nickname = '익명';
    }
    const user = new User(id, email, nickname, password, role, type);
    return user;
  }

  static createUser(user: {
    id: string;
    email: string;
    nickname: string;
    password: string;
    role: UserRole;
    type: UserType;
  }) {
    return new User(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
    );
  }

  reconstitute(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): User {
    if (nickname === undefined) {
      nickname = '익명';
    }
    return new User(id, email, nickname, password, role, type);
  }
}
