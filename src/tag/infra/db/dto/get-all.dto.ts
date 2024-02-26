import { TagEntity } from '../entity/tag.entity';

interface Tag {
  id: string;
  tag: string;
}

export class GetAllDto {
  readonly #tags: Tag[] = [];

  constructor(entities: TagEntity[]) {
    entities.forEach((entity) => {
      this.#tags.push({
        id: entity.id,
        tag: entity.tag,
      });
    });
  }

  get tags() {
    return this.#tags;
  }
}
