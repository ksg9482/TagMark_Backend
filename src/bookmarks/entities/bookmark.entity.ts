import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Domain } from "./domain.entity";
import { Tag } from "src/tags/entities/tag.entity";
import { Bookmarks_Tags } from "src/tags/entities/bookmarks_tags.entity";

@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @ManyToOne(
        () => Domain,
        domain => domain.domain
    )
    @JoinColumn()
    domain: Domain

    // @JoinColumn({
    //     name:'domain_id',
    //     referencedColumnName:'id'
    // })
    // domain_id:number

    @Column({unique:true})
    @ApiProperty({ description: 'URL 패스 & 세부사항' })
    path: string;

    @ManyToOne(
        () => User,
        user => user.bookmarks,
        {onDelete:"CASCADE"},
    )
    @JoinColumn()
    user:User;

    // @JoinColumn({
    //     name:'user_id',
    //     referencedColumnName:'id'
    // })
    // @ApiProperty({ description: '작성한 사용자의 id', type:"number" })
    // user_id:number;

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