import { UserImpl } from './types/userImpl';
import { UserRole } from './types/userRole';
import { UserType } from './types/userType';
export class User implements UserImpl {
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

  updateNickName(nickname: string) {
    this._nickname = nickname;
  }

  updatePassword(password: string) {
    this._password = password;
  }
}

export interface ResponseUser {
  id: string;
  email: string;
  nickname: string;
}
