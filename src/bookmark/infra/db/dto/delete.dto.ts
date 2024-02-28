import { BookmarkEntity } from '../entity/bookmark.entity';

export class DeleteDto {
  readonly #id: string;

  constructor(entity: BookmarkEntity) {
    this.#id = entity.id;
  }

  get id() {
    return this.#id;
  }
}
