import { UserEntity } from '../entity/user.entity';

export class UpdateDto {
  readonly #id: string;

  constructor(entity: UserEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }
}
