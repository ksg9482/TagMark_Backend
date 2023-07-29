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

  updateTag(tag: string) {
    this.tag = tag;
    return this.tag;
  }
}
// setter를 지양해야 하는 이유 setter가 생성인지 변경인지 명확하지 않다.
// 업데이트라면 명시적으로 메서드를 생성하는 것이 좋다
// 불변객체로 이용하려면?
