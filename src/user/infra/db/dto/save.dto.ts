import { UserEntity } from '../entity/user.entity';

export class SaveDto {
  #id: string;

  private constructor(entity: UserEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }

  static from(entity: UserEntity) {
    const dto = new SaveDto(entity);
    return dto;
  }
}
