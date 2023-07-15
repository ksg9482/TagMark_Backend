export class Tag {
  constructor(private id: string, private tag: string) {
    this.id = id;
    this.tag = tag;
  }

  getId(): Readonly<string> {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  getTag(): Readonly<string> {
    return this.tag;
  }

  setTag(tag: string) {
    this.tag = tag;
  }
}
