import { UserRole } from '../interface/UserRole';
import { UserType } from '../interface/UserType';
export class User {
  constructor(
    private id: string, //uuid
    private email: string,
    private nickname: string,
    private password: string,
    private signupVerifyToken: string,
    private role: UserRole,
    private type: UserType,
  ) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getNickName(): Readonly<string> {
    return this.nickname;
  }

  getEmail(): Readonly<string> {
    return this.email;
  }
}
