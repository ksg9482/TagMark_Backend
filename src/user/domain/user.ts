import { UserRole } from './types/userRole';
import { UserType } from './types/userType';
interface UserInput {
  id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  type: UserType;
}
export class User {
  readonly #id: string;
  readonly #email: string;
  #nickname: string;
  #password: string;
  #role: UserRole;
  #type: UserType;

  constructor(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) {
    this.#id = id;
    this.#email = email;
    this.#nickname = nickname;
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

  static from(user: UserInput) {
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
