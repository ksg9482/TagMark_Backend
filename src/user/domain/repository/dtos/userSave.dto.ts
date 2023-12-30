import { UserRole } from '../../types/userRole';
import { UserType } from '../../types/userType';

interface UserSaveData {
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  type: UserType;
}
export class UserSaveDto {
  readonly #email: string;
  readonly #nickname: string;
  readonly #password: string;
  readonly #role: UserRole;
  readonly #type: UserType;

  private constructor(userSaveDto: UserSaveData) {
    this.#email = userSaveDto.email;
    this.#nickname = userSaveDto.nickname;
    this.#password = userSaveDto.password;
    this.#role = userSaveDto.role;
    this.#type = userSaveDto.type;
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

  //class를 바로 받지 않는 이유. 클래스와 동일한 구조를 가진 인터페이스를 사용하는 방법 외에,
  //TypeScript에서는 클래스 자체를 타입으로 사용하는 기능은 제공되지 않는다.
  static of(userSaveDto: UserSaveData) {
    return new UserSaveDto(userSaveDto);
  }
}
