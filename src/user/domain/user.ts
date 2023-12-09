import { UserRole } from './types/userRole';
import { UserType } from './types/userType';
export class User {
  private readonly _id: string;
  private readonly _email: string;
  private _nickname: string;
  private _password: string;
  private _role: UserRole; //이거도 클래스화 enum으로 충분? role은 없애자
  private _type: UserType;

  constructor(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) {
    this._id = id;
    this._email = email;
    this._nickname = nickname;
    this._password = password;
    this._role = role;
    this._type = type;
  }

  get id() {
    return this._id;
  }
  get email() {
    return this._email;
  }
  get nickname() {
    return this._nickname;
  }
  get password() {
    return this._password;
  }
  get role() {
    return this._role;
  }
  get type() {
    return this._type;
  }

  //클래스 내부에서 static 메서드 팩토리로 할 것인가, 아니면 팩토리 클래스를 별로도 만들것인가. 뭐가 더 유연하고 견고할까?
  static from(user: {
    id: string;
    email: string;
    nickname: string;
    password: string;
    role: UserRole;
    type: UserType;
  }) {
    const userInstance = new User(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
    );
    return userInstance;
  }
  updateNickName(nickname: string) {
    this._nickname = nickname;
  }

  updatePassword(password: string) {
    this._password = password;
  }

  getWithOutPassword() {
    return {
      id: this._id,
      email: this._email,
      nickname: this._nickname,
      role: this._role,
      type: this._type,
    };
  }
}
