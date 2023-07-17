export class Tag {
  constructor(private id: string, private tag: string) {
    this.id = id;
    this.tag = tag;
  }

  getId(): Readonly<string> {
    return this.id;
  }

  getTag(): Readonly<string> {
    return this.tag;
  }
}
