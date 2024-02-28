import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';

interface Tag {
  id: string;
  tag: string;
}

export class InsertBulkDto {
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
