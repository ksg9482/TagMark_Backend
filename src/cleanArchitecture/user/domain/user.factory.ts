import { Injectable } from '@nestjs/common';
import { User } from 'src/cleanArchitecture/user/domain/user';
import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';

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
