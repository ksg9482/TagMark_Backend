interface AttachTag {
  id: string;
  bookmarkId: string;
  tagId: string;
}

export class AttachTagDto {
  readonly #attaches: AttachTag[] = [];

  constructor(attach: AttachTag[]) {
    attach.forEach((item) => {
      this.#attaches.push({
        id: item.id,
        bookmarkId: item.bookmarkId,
        tagId: item.tagId,
      });
    });
  }

  get attaches() {
    return this.#attaches;
  }
}
