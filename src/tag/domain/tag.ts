export class Tag {
  #tag: string;

  constructor(readonly id: string, tag: string) {
    this.#tag = tag;
  }
  get tag() {
    return this.#tag;
  }
}
