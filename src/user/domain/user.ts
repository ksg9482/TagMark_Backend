import { UserRole } from './types/userRole';
import { UserType } from './types/userType';
export class User {
  readonly #id: string;
  readonly #email: string;
  #nickname: string;
  #password: string;
  #role: UserRole; //이거도 클래스화 enum으로 충분? role은 없애자
  #type: UserType;

  constructor(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) {
    this.#nickname = nickname;
    this.#id = id;
    this.#email = email;
    // this.nickname = nickname;
    this.#password = password;
    this.#role = role;
    this.#type = type;
  }

  get id() {
    return this.#id;
  }
  get email() {
    return this.#email;
  }
  get nickname() {
    return this.#nickname;
  }
  get password() {
    return this.#password;
  }
  get role() {
    return this.#role;
  }
  get type() {
    return this.#type;
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
    return new User(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
    );
  }
  updateNickName(nickname: string) {
    this.#nickname = nickname;
  }

  updatePassword(password: string) {
    this.#password = password;
  }

  getWithOutPassword() {
    return {
      id: this.#id,
      email: this.#email,
      nickname: this.#nickname,
      role: this.#role,
      type: this.#type,
    };
  }
}
