import { Tag } from 'src/cleanArchitecture/tag/domain/tag';

export class Bookmark {
  constructor(
    private id: string,
    private url: string,
    private userId: string,
    private tags?: Tag[],
  ) {}

  getId(): Readonly<string> {
    return this.id;
  }

  getUrl(): Readonly<string> {
    return this.url;
  }

  getTags(): Readonly<Tag[]> {
    if (this.tags === undefined) {
      return [];
    }
    return this.tags;
  }

  getUserId(): Readonly<string> {
    return this.userId;
  }

  getAll() {
    return {
      id: this.id,
      url: this.url,
      tags: this.tags,
      userId: this.userId,
    };
  }

  updateUrl(url: string) {
    this.url = url;
    return {
      url: this.url,
    };
  }

  updateTags(tags: Tag[]) {
    this.tags = tags;
    return {
      tags: this.tags,
    };
  }
}
