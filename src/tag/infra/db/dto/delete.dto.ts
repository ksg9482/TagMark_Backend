import { TagEntity } from '../entity/tag.entity';

export class DeleteDto {
  readonly #id: string;

  constructor(entity: TagEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }
}
