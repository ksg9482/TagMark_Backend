import { UserRole } from '../../types/userRole';
import { UserType } from '../../types/userType';

export interface UserSaveData {
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  type: UserType;
}
export class UserSaveDto {
  private readonly _email: string;
  private _nickname: string;
  private _password: string;
  private _role: UserRole;
  private _type: UserType;

  private constructor(userSaveDto: UserSaveData) {
    this._email = userSaveDto.email;
    this._nickname = userSaveDto.nickname;
    this._password = userSaveDto.password;
    this._role = userSaveDto.role;
    this._type = userSaveDto.type;
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

  //class를 바로 받지 않는 이유. 클래스와 동일한 구조를 가진 인터페이스를 사용하는 방법 외에,
  //TypeScript에서는 클래스 자체를 타입으로 사용하는 기능은 제공되지 않는다.
  static of(userSaveDto: UserSaveData) {
    return new UserSaveDto(userSaveDto);
  }
}
