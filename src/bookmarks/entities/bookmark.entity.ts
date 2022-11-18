import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Tag } from "src/tags/entities/tag.entity";
import { Bookmarks_Tags } from "src/tags/entities/bookmarks_tags.entity";

@Entity()
export class Bookmark {
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