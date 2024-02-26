import { TagEntity } from '../entity/tag.entity';

export class GetDto {
  readonly #id: string;
  readonly #tag: string;

  constructor(entity: TagEntity) {
    this.#id = entity.id;
    this.#tag = entity.tag;
  }

  get id() {
    return this.#id;
  }
  get tag() {
    return this.#tag;
  }
}
