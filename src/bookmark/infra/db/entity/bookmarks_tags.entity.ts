import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { TagEntity as Tag } from 'src/tag/infra/db/entity/tag.entity';
import { BookmarkEntity as Bookmark } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { UtilsService } from 'src/utils/utils.service';

const util = new UtilsService();
util.getUuid();
@Entity('bookmark_tag')
export class Bookmarks_TagsEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Bookmark, (bookmark) => bookmark.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'bookmarkId',
    referencedColumnName: 'id',
  })
  bookmark: Bookmark;

  @Column()
  bookmarkId: string;

  @ManyToOne(() => Tag, (tag) => tag.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tagId',
    referencedColumnName: 'id',
  })
  tag: Tag;

  @Column()
  tagId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
