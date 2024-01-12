import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Bookmark } from '../domain/bookmark';

export class PageRequest {
  @IsString()
  @IsOptional()
  pageNo?: number | 1;

  @IsString()
  @IsOptional()
  pageSize?: number | 20;

  getOffset(): number {
    const minimumPageNo = 1;
    const minimumPageSize = 20;

    if (this.pageNo === undefined || this.pageNo < minimumPageNo) {
      this.pageNo = minimumPageNo;
    }
    if (this.pageSize === undefined || this.pageSize < minimumPageSize) {
      this.pageSize = minimumPageSize;
    }

    return (Number(this.pageNo) - 1) * Number(this.pageSize);
  }

  getLimit(): number {
    const minimumPageSize = 20;
    if (
      this.pageSize === undefined ||
      (this.pageSize && this.pageSize < minimumPageSize)
    ) {
      this.pageSize = minimumPageSize;
    }
    return Number(this.pageSize);
  }
}

export class Page<T> {
  @Expose()
  pageSize: number;
  @Expose()
  totalCount: number;
  @Expose()
  totalPage: number;
  @Expose()
  bookmarks: T[];
  constructor(totalCount: number, pageSize: number, bookmarks: T[]) {
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.totalPage = Math.ceil(totalCount / pageSize);
    this.bookmarks = bookmarks;
  }

  // get bookmark() {
  //   return this.bookmarks;
  // }
}

export class BookmarkPage extends Page<Bookmark> {
  // readonly #bookmarks: Bookmark[]
  constructor(totalCount: number, pageSize: number, bookmarks: Bookmark[]) {
    super(totalCount, pageSize, bookmarks);
  }
}
