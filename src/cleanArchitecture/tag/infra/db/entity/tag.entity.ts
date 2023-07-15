import { ApiProperty } from '@nestjs/swagger';
import {
  Bookmark,
  Bookmarks_Tags,
} from 'src/frameworks/data-services/postgresql/model';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Tag')
export class TagEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: '태그' })
  tag: string;

  @OneToMany(
    () => Bookmarks_Tags,
    (bookmarks_tags) => bookmarks_tags.bookmark,
    { onDelete: 'CASCADE' },
  )
  bookmarks?: Bookmark[];
}
