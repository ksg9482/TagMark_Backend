import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { SimilarTag } from "./similarTag.entity";
import { Bookmark } from "src/bookmarks/entities/bookmark.entity";
import { Bookmarks_Tags } from "./bookmarks_tags.entity";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column({unique:true})
    @ApiProperty({ description: '태그' })
    tag: string;

    @OneToMany(
        () => SimilarTag,
        SimilarTag => SimilarTag.similar_tag
    )
    similarTags:SimilarTag[];
    
    @OneToMany(
        ()=>Bookmarks_Tags,
        bookmarks_tags => bookmarks_tags.bookmark
    )
    bookmarks:Bookmark[]

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}