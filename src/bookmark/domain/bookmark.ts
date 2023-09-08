import { Tag } from 'src/tag/domain/tag';

export class Bookmark {
  url: string;
  //tags: Tag[] | undefined;
  constructor(
    readonly id: string,
    readonly userId: string,
    url: string,
    readonly tags?: Tag[], //북마크에 담긴 tag를 조작할 일이 있을까?
  ) {
    this.url = url;
    //this.tags = tags;
  }

  // updateTags(tags:Tag[]) {
  //   return new Bookmark(this.id, this.userId, this.url, tags)
  // }
  // getId(): Readonly<string> {
  //   return this.id;
  // }

  // getUrl(): Readonly<string> {
  //   return this.url;
  // }

  // getTags(): Readonly<Tag[]> {
  //   if (this.tags === undefined) {
  //     return [];
  //   }
  //   return this.tags;
  // }

  // getUserId(): Readonly<string> {
  //   return this.userId;
  // }

  // getAll():Bookmark {
  //   const bookmark = new Bookmark(this.id, this.url, this.userId, this.tags)
  //   return bookmark;
  // }

  // updateUrl(url: string) {
  //   this.url = url;
  //   return {
  //     url: this.url,
  //   };
  // }

  // updateTags(tags: Tag[]) {
  //   this.tags = tags;
  //   return {
  //     tags: this.tags,
  //   };
  // }
}
