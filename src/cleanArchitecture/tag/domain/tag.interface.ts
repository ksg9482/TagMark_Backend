import { Tag } from 'src/cleanArchitecture/tag/domain/tag';

export interface TagWithCount extends Tag {
  count: number;
}
