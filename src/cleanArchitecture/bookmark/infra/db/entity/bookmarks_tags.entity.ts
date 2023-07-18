import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TagEntity as Tag } from "src/cleanArchitecture/tag/infra/db/entity/tag.entity";
import { BookmarkEntity as Bookmark } from "src/cleanArchitecture/bookmark/infra/db/entity/bookmark.entity";


@Entity()
export class Bookmarks_TagsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => Bookmark,
        bookmark => bookmark.tags,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: 'bookmarkId',
        referencedColumnName: 'id'
    })
    bookmark: Bookmark;

    @Column()
    bookmarkId: number;

    @ManyToOne(
        () => Tag,
        tag => tag.bookmarks,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: 'tagId',
        referencedColumnName: 'id'
    })
    tag: Tag;

    @Column()
    tagId: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @CreateDateColumn({ type: "timestamp" })
    updatedAt: Date;

}