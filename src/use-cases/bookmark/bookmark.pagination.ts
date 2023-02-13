import { IsOptional, IsString } from "class-validator";

export class PageRequest {
  @IsString()
  @IsOptional()
  pageNo?: number | 1;

  @IsString()
  @IsOptional()
  pageSize?: number | 20;

  getOffset(): number {
    if (this.pageNo! < 1 || !this.pageNo) {
      this.pageNo = 1;
    }

    if (this.pageSize! < 1 || !this.pageSize) {
      this.pageSize = 20;
    }

    return (Number(this.pageNo) - 1) * Number(this.pageSize);
  }

  getLimit(): number {
    if (this.pageSize! < 1 || !this.pageSize) {
      this.pageSize = 20;
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