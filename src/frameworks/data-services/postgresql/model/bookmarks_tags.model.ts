import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
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
    bookmark:Bookmark

    @ManyToOne(
        () => Tag,
        tag => tag.bookmarks,
        {onDelete:"CASCADE"}
    )
    tag:Tag

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}