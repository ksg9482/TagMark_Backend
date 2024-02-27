import { BookmarkEntity } from '../entity/bookmark.entity';
interface Tag {
  id: string;
  tag: string;
}
interface Bookmark {
  id: string;
  url: string;
  userId: string;
  tags: Tag[];
}
[];

export class BookmarkWithCountDto {
  #Bookmarks: Bookmark[] = [];
  #count: number;

  constructor(bookmarkEntities: BookmarkEntity[], count: number) {
    bookmarkEntities.forEach((item) => {
      const tags = item.tags.map((tag) => {
        return { id: tag.id, tag: tag.tag };
      });
      this.#Bookmarks.push({
        id: item.id,
        url: item.url,
        userId: item.userId,
        tags: tags,
      });
    });
  }

  get Bookmarks() {
    return this.#Bookmarks;
  }

  get count() {
    return this.#count;
  }
}
