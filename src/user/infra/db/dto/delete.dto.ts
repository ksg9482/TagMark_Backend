import { UserEntity } from '../entity/user.entity';

export class DeleteDto {
  readonly #id: string;

  constructor(entity: UserEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }
}
