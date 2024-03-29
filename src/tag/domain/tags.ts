import { Expose } from 'class-transformer';
import { Tag } from './tag';

export class Tags {
  #tags: Tag[];

  constructor(tags: Tag[]) {
    this.#tags = tags;
  }

  @Expose()
  get tags() {
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

  mergeTags(tags: Tags): void {
    this.#tags.push(...tags.tags);
  }
}
