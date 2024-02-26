interface DetachTag {
  id: string;
  bookmarkId: string;
  tagId: string;
}

export class DetachTagDto {
  readonly #deteches: DetachTag[] = [];

  constructor(detech: DetachTag[]) {
    detech.forEach((item) => {
      this.#deteches.push({
        id: item.id,
        bookmarkId: item.bookmarkId,
        tagId: item.tagId,
      });
    });
  }

  get deteches() {
    return this.#deteches;
  }
}
