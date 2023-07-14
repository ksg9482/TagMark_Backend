import { Tag } from 'src/frameworks/data-services/postgresql/model';

export interface TagWithCount extends Tag {
  count: number;
}
