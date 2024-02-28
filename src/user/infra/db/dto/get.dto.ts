import { UserRole, UserType } from 'src/user/interface';
import { UserEntity } from '../entity/user.entity';

export class GetDto {
  readonly #id: string;
  readonly #email: string;
  readonly #nickname: string;
  readonly #password: string;
  readonly #role: UserRole;
  readonly #type: UserType;

  constructor(entity: UserEntity) {
    this.#id = entity.id;
    this.#email = entity.email;
    this.#nickname = entity.nickname;
    this.#password = entity.password;
    this.#role = entity.role;
    this.#type = entity.type;
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
}
