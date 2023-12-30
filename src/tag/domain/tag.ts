export class Tag {
  readonly #id: string;
  #tag: string;

  constructor(id: string, tag: string) {
    this.#id = id;
    this.#tag = tag;
  }
  get id() {
    return this.#id;
  }
  get tag() {
    return this.#tag;
  }
}
