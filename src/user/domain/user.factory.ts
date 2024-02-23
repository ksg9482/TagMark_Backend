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
    return User.from({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      password: user.password,
      role: user.role,
      type: user.type,
    });
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
    return User.from({ id, email, nickname, password, role, type });
  }
}
