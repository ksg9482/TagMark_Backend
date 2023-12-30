import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';

export class Bookmark {
  readonly #id: string;
  readonly #userId: string;
  #url: string;
  //객체지행 생활체조 규칙8. 콜렉션을 포함한 클래스는 반드시 다른 멤버 변수가 없어야 한다.
  //tags를 Tag[]가 아니라 일급 컬렉션을 형성하여 사용한다.
  #tags: Tags;

  constructor(id: string, userId: string, url: string, tags: Tags) {
    this.#id = id;
    this.#url = url;
    this.#userId = userId;
    this.#tags = tags;
  }

  get id() {
    return this.#id;
  }

  get userId() {
    return this.#userId;
  }

  get url() {
    return this.#url;
  }

  get tags() {
    return this.#tags.tags; // || [];
  }

  static from(id: string, userId: string, url: string, tags?: Tags) {
    if (tags === undefined) {
      tags = new Tags([]);
    }
    return new Bookmark(id, userId, url, tags);
  }
  updateUrl(url: string) {
    this.#url = url;
  }

  updateTags(tags: Tags) {
    this.#tags = tags;
  }
}
