import { Tag } from 'src/tag/domain/tag';

export class Bookmark {
  url: string;
  //객체지행 생활체조 규칙8. 콜렉션을 포함한 클래스는 반드시 다른 멤버 변수가 없어야 한다.
  //tags를 Tag[]가 아니라 일급 컬렉션을 형성하여 사용한다.
  tags: Tag[];
  constructor(
    readonly id: string,
    readonly userId: string,
    url: string,
    tags?: Tag[],
  ) {
    this.url = url;
    this.tags = tags || [];
  }
}
