export class Tag {
  constructor(protected id: string, protected tag: string) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getTag(): Readonly<string> {
    return this.tag;
  }

  updateTag(tag: string) {
    this.tag = tag;
    return this.tag;
  }
}
