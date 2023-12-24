import { Tag } from './tag';

type ITags = Tag[] | []; //Tag[]라는 타입이 올 수 있고, 빈배열 타입이 올수 있다. 타입 별칭이 맞다고 판단.

export class Tags {
  private _tags: Tag[];

  constructor(tags: Tag[]) {
    this._tags = tags;
  }

  get tags() {
    return this._tags;
  }
}
