import { BookmarkEntity } from '../entity/bookmark.entity';

export class UpdateDto {
  readonly #id: string;
  readonly #url: string;
  readonly #userId: string;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  constructor(entity: BookmarkEntity) {
    this.#id = entity.id;
    this.#url = entity.url;
    this.#userId = entity.userId;
    this.#createdAt = entity.createdAt;
    this.#updatedAt = entity.updatedAt;
  }

  get id() {
    return this.#id;
  }
  get url() {
    return this.#url;
  }
  get userId() {
    return this.#userId;
  }
  get createdAt() {
    return this.#createdAt;
  }
  get updatedAt() {
    return this.#updatedAt;
  }
}
