import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Users_Tags } from "./users_tags.entity";
import { Bookmark } from "src/bookmarks/entities/bookmark.entity";
import { Bookmarks_Tags } from "./bookmarks_tags.entity";
import { User } from "src/users/entities/user.entity";

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