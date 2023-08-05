import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';
export class User {
  constructor(
    protected id: string, //uuid
    protected email: string,
    protected nickname: string,
    protected password: string,
    protected role: UserRole,
    protected type: UserType,
  ) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getEmail(): Readonly<string> {
    return this.email;
  }

  getNickName(): Readonly<string> {
    return this.nickname;
  }

  getPassword(): Readonly<string> {
    return this.password;
  }

  getRole(): Readonly<UserRole> {
    return this.role;
  }

  getType(): Readonly<UserType> {
    return this.type;
  }

  updatePassword(password: string) {
    this.password = password;
    return this.password;
  }

  updateNickname(nickname: string) {
    this.nickname = nickname;
    return this.nickname;
  }
}
