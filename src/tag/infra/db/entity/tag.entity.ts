import { ApiProperty } from '@nestjs/swagger';
import { BookmarkEntity as Bookmark } from "src/bookmark/infra/db/entity/bookmark.entity";
import { Bookmarks_TagsEntity as Bookmarks_Tags } from "src/bookmark/infra/db/entity/bookmarks_tags.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Tag')
export class TagEntity {
  @PrimaryColumn()
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
