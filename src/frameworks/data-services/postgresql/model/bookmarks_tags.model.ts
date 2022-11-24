import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Bookmark, Tag } from "./";

@Entity()
export class Bookmarks_Tags {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;
    
    @ManyToOne(
        () => Bookmark,
        bookmark => bookmark.tags,
        {onDelete:"CASCADE"}
    )
    @JoinColumn({
        name: 'bookmarkId',
        referencedColumnName:'id'
    })
    bookmark:Bookmark
    
    @Column()
    bookmarkId:number

    @ManyToOne(
        () => Tag,
        tag => tag.bookmarks,
        {onDelete:"CASCADE"}
    )
    @JoinColumn({
        name: 'tagId',
        referencedColumnName:'id'
    })
    tag:Tag
    
    @Column()
    tagId:number

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}