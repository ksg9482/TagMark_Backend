import { Expose } from 'class-transformer';

export class Tag {
  readonly #id: string;
  #tag: string;

  constructor(id: string, tag: string) {
    this.#id = id;
    this.#tag = tag;
  }
  @Expose()
  get id() {
    return this.#id;
  }
  @Expose()
  get tag() {
    return this.#tag;
  }
}
