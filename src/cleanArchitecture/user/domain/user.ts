import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';
export class User {
  constructor(
    private id: string, //uuid
    private email: string,
    private nickname: string,
    private password: string,
    private role: UserRole,
    private type: UserType,
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
}
