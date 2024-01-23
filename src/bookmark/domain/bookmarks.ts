import { Bookmark } from './bookmark';

export class Bookmarks {
  #bookmarks: Bookmark[];

  constructor(bookmarks: Bookmark[]) {
    this.#bookmarks = bookmarks;
  }

  get bookmarks(): Bookmark[] {
    return this.#bookmarks;
  }
}
