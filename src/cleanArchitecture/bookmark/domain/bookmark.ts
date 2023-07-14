import { Tag } from 'src/cleanArchitecture/tag/domain/tag';

export class Bookmark {
  constructor(
    private id: string,
    private url: string,
    private tags: Tag[],
    private userId: string,
  ) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getUrl(): Readonly<string> {
    return this.url;
  }

  getTags(): Readonly<Tag[]> {
    return this.tags;
  }

  getUserId(): Readonly<string> {
    return this.userId;
  }
}
