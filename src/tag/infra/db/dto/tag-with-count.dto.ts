interface TagWithCount {
  id: string;
  tag: string;
  count: number;
}
[];

export class TagWithCountsDto {
  #tagWithCounts: TagWithCount[] = [];

  constructor(tagWithCounts: TagWithCount[]) {
    tagWithCounts.forEach((item) => {
      this.#tagWithCounts.push({
        id: item.id,
        tag: item.tag,
        count: item.count,
      });
    });
  }

  get tagWithCounts() {
    return this.#tagWithCounts;
  }
}
