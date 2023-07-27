import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bookmark, Tag } from './';

@Entity()
export class Bookmarks_Tags {
  @PrimaryGeneratedColumn()
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
  bookmarkId: number;

  @ManyToOne(() => Tag, (tag) => tag.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tagId',
    referencedColumnName: 'id',
  })
  tag: Tag;

  @Column()
  tagId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
