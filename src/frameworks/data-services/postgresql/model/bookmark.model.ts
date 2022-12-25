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
    user?:User;

    @Column()
    @ApiProperty({ description: '북마크 생성한 유저 아이디' })
    userId: number

    @OneToMany(
        ()=>Bookmarks_Tags,
        bookmarks_tags => bookmarks_tags.tag
    )
    //그냥 부르면 [null]발생. lazy loading으로 불러오게 만듦.
    @ApiProperty({ description: '태그 배열', type:()=>[Tag]})
    tags:Tag[]
    
    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}