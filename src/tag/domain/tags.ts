import { Expose } from 'class-transformer';
import { Tag } from './tag';

export class Tags {
  #tags: Tag[];

  constructor(tags: Tag[]) {
    this.#tags = tags;
  }

  @Expose()
  get tags() {
    console.log('Tags 호출');
    console.log(this.#tags);
    return this.#tags;
  }

  findTag(tagName: string) {
    return this.#tags.find((tag) => {
      return tag.tag === tagName;
    });
  }

  findNotExistTagNames(tagNames: string[]): string[] {
    const tagMap = new Map<String, Tag>();
    this.#tags.forEach((tag) => {
      tagMap.set(tag.tag, tag);
    });

    const notExistTagNames = tagNames.filter((tagName) => {
      return tagMap.get(tagName) === undefined;
    });

    return notExistTagNames;
  }
}
