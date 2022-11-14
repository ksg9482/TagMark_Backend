import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bookmark, Bookmarks_Tags, User, Users_Tags } from "./";


@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column({unique:true})
    @ApiProperty({ description: '태그' })
    tag: string;

    
    @OneToMany(
        ()=>Bookmarks_Tags,
        bookmarks_tags => bookmarks_tags.bookmark
    )
    bookmarks:Bookmark[]

    @OneToMany(
        ()=>Users_Tags,
        users_tags => users_tags.user
    )
    users:User[]

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}