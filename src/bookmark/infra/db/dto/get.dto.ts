import { BookmarkEntity } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';

export class GetDto {
  readonly #id: string;
  readonly #url: string;
  readonly #userId: string;
  readonly #tags: Tags;
  constructor(entity: BookmarkEntity) {
    const tags = GetDto.getTagDomain(entity);

    this.#id = entity.id;
    this.#url = entity.url;
    this.#userId = entity.userId;
    this.#tags = tags;
  }

  static getTagDomain(entity: BookmarkEntity) {
    return new Tags(
      entity.tags.map((tag) => {
        return new Tag(tag.id, tag.tag);
      }),
    );
  }

  get id() {
    return this.#id;
  }
  get url() {
    return this.#url;
  }
  get userId() {
    return this.#userId;
  }
  get tags() {
    return this.#tags;
  }
}
