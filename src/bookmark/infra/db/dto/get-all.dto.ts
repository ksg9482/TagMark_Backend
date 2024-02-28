import { Tag } from 'src/tag/domain/tag';
import { BookmarkEntity } from '../entity/bookmark.entity';

interface Bookmark {
  id: string;
  url: string;
  userId: string;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllDto {
  readonly #bookmarks: Bookmark[] = [];

  constructor(entities: BookmarkEntity[]) {
    entities.forEach((entity) => {
      const tags = GetAllDto.getTagDomain(entity);
      this.#bookmarks.push({
        id: entity.id,
        url: entity.url,
        userId: entity.userId,
        tags: tags,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });
  }

  static getTagDomain(entity: BookmarkEntity) {
    return entity.tags.map((tag) => {
      return new Tag(tag.id, tag.tag);
    });
  }

  get bookmarks() {
    return this.#bookmarks;
  }
}
