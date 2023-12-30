import { UserEntity } from '../entity/user.entity';

export class GetDto {
  #id: string;
  #email: string;
  #nickname: string;
  #password: string;
  #role: string;
  #type: string;

  private constructor(entity: UserEntity) {
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

  static from(entity: UserEntity) {
    const dto = new GetDto(entity);
    return dto;
  }
}
