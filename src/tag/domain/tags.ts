import { Expose } from 'class-transformer';
import { Tag } from './tag';

export class Tags {
  #tags: Tag[] = [];

  constructor(tags: Tag[]) {
    this.#tags = tags;
  }

  @Expose()
  get tags() {
    return this.#tags;
  }

  //태그 비교도 여기
  findTag(tagName: string) {
    return this.#tags.find((tag) => {
      return tag.tag === tagName;
    });
  }
}
