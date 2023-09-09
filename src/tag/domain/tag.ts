export class Tag {
  tag: string;
  constructor(
    readonly id: string, 
    tag: string
    ) {
      this.tag = tag;
    }

  // getId(): Readonly<string> {
  //   return this.id;
  // }

  // getTag(): Readonly<string> {
  //   return this.tag;
  // }

  // updateTag(tag: string) {
  //   this.tag = tag;
  //   return this.tag;
  // }
}
