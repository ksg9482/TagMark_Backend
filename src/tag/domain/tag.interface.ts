import { Tag } from 'src/tag/domain/tag';

export class TagWithCount extends Tag {
  constructor(
    protected id: string,
    protected tag: string,
    protected count: number,
  ) {
    super(id, tag);
    this.count = count;
  }

  getCount() {
    return this.count;
  }
}
