import { Tag } from 'src/tag/domain/tag';

export class Bookmark {
  url: string;
  tags: Tag[];
  constructor(
    readonly id: string,
    readonly userId: string,
    url: string,
    tags?: Tag[],
  ) {
    this.url = url;
    this.tags = tags || [];
  }
}
