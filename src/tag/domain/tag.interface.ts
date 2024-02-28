import { Tag } from 'src/tag/domain/tag';

export class TagWithCount extends Tag {
  #count: number;
  constructor(id: string, tag: string, readonly tagCount: number) {
    super(id, tag);
    this.#count = tagCount;
  }

  get count() {
    return this.#count;
  }
}

export class TagWithCounts {
  #tagWithCounts: TagWithCount[] = [];
  constructor(tagWithCounts: TagWithCount[]) {
    tagWithCounts.forEach((tagWithCount) => {
      this.#tagWithCounts.push(tagWithCount);
    });
  }

  get tagWithCounts() {
    return this.#tagWithCounts;
  }
}

export class AttachTagId {
  #id: string;
  #bookmarkId: string;
  #tagId: string;

  constructor(id: string, bookmarkId: string, tagId: string) {
    this.#id = id;
    this.#bookmarkId = bookmarkId;
    this.#tagId = tagId;
  }

  get id() {
    return this.#id;
  }

  get bookmarkId() {
    return this.#bookmarkId;
  }

  get tagId() {
    return this.#tagId;
  }
}

export class AttachTagIds {
  #attachTagIds: AttachTagId[] = [];

  constructor(attachTagIds: AttachTagId[]) {
    this.#attachTagIds = attachTagIds;
  }

  get attachTagIds() {
    return this.#attachTagIds;
  }
}
