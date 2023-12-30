import { UserEntity } from '../entity/user.entity';

export class DeleteDto {
  #id: string;

  private constructor(entity: UserEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }

  static from(entity: UserEntity) {
    const dto = new DeleteDto(entity);
    return dto;
  }
}
