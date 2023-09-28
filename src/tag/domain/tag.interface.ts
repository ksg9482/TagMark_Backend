import { Tag } from 'src/tag/domain/tag';

export class TagWithCount extends Tag {
  constructor(id: string, tag: string, readonly count: number) {
    super(id, tag);
    this.count = count;
  }
}
