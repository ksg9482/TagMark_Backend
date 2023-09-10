import { IsOptional, IsString } from 'class-validator';

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
    if (this.pageSize === undefined || this.pageSize! < minimumPageSize) {
      this.pageSize = minimumPageSize;
    }
    return Number(this.pageSize);
  }
}

export class Page<Bookmark> {
  pageSize: number;
  totalCount: number;
  totalPage: number;
  bookmarks: Bookmark[];
  constructor(totalCount: number, pageSize: number, bookmarks: Bookmark[]) {
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.totalPage = Math.ceil(totalCount / pageSize);
    this.bookmarks = bookmarks;
  }
}
