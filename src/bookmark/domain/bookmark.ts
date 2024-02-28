import { Expose } from 'class-transformer';
import { Tags } from 'src/tag/domain/tags';

export class Bookmark {
  readonly #id: string;
  readonly #userId: string;
  #url: string;
  #tags: Tags;

  constructor(id: string, userId: string, url: string, tags: Tags) {
    this.#id = id;
    this.#url = url;
    this.#userId = userId;
    this.#tags = tags;
  }

  @Expose()
  get id() {
    return this.#id;
  }

  @Expose()
  get userId() {
    return this.#userId;
  }

  @Expose()
  get url() {
    return this.#url;
  }

  @Expose()
  get tags() {
    return this.#tags.tags; //.tags; // || [];
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
