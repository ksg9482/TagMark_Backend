import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bookmarks_Tags, Tag, User } from "./";
import { Bookmark as BookmarkAbstract } from "src/core"
@Entity()
export class Bookmark implements BookmarkAbstract {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column()
    @ApiProperty({ description: 'URL' })
    url: string;

    @ManyToOne(
        () => User,
        user => user.bookmarks,
        {onDelete:"CASCADE"},
    )
    @JoinColumn({
        name: 'userId',
        referencedColumnName:'id'
    })
    user:User;

    @Column()
    userId: number

    @OneToMany(
        ()=>Bookmarks_Tags,
        bookmarks_tags => bookmarks_tags.tag
    )
    tags:Tag[]
    
    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}