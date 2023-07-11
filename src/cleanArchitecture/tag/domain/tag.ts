export class Tag {
  constructor(
    private id: string,
    private tag: string
  ) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getTas(): Readonly<string> {
    return this.tag;
  }
}