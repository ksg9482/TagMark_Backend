import { ApiProperty } from '@nestjs/swagger';
import { BookmarkEntity as Bookmark } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { Bookmarks_TagsEntity as bookmark_tag } from 'src/bookmark/infra/db/entity/bookmarks_tags.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('tag')
export class TagEntity {
  @PrimaryColumn()
  @ApiProperty({ description: 'id' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: '태그' })
  tag: string;

  @OneToMany(() => bookmark_tag, (bookmark_tag) => bookmark_tag.bookmark, {
    onDelete: 'CASCADE',
  })
  bookmarks?: Bookmark[];
}
