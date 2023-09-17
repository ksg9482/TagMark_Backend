import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { TagEntity as Tag } from 'src/tag/infra/db/entity/tag.entity';
import { Bookmarks_TagsEntity as bookmark_tag } from 'src/bookmark/infra/db/entity/bookmarks_tags.entity';
import { UserEntity as User } from 'src/user/infra/db/entity/user.entity';

@Entity('bookmark')
export class BookmarkEntity {
  @PrimaryColumn()
  @ApiProperty({ description: 'id' })
  id: string;

  @Column()
  @ApiProperty({ description: 'URL' })
  url: string;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  user?: User;

  @Column()
  @ApiProperty({ description: '북마크 생성한 유저 아이디' })
  userId: string;

  @OneToMany(() => bookmark_tag, (bookmark_tag) => bookmark_tag.tag)
  @ApiProperty({ description: '태그 배열', type: () => [Tag] })
  tags: Tag[];

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: '생성날짜' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: '수정날짜' })
  updatedAt: Date;
}
