import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Url } from "./url.entity";
import { Tag } from "src/tags/entities/tag.entity";
import { Bookmarks_Tags } from "src/tags/entities/bookmarks_tags.entity";

@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @ManyToOne(
        () => Url,
        url => url.bookmarks,
        {onDelete:"CASCADE"} //여기서 설정해야 url지워지면 북마크도 지워짐. url이 지워지면 북마크도 지운다
    )
    @JoinColumn({
        name:'urlId',
        referencedColumnName:'id'
    })
    url: Url

    @Column()
    urlId:number
    // @ManyToOne(
    //     () => Domain,
    //     domain => domain.domain
    // )
    // domain: Domain
    
    // @JoinColumn({
    //     name: 'domainId',
    //     referencedColumnName:'id'
    // })
    // @Column()
    // domainId: number

    // @JoinColumn({
    //     name:'domain_id',
    //     referencedColumnName:'id'
    // })
    // domain_id:number

    // @Column({unique:true})
    // @ApiProperty({ description: 'URL 패스 & 세부사항' })
    // path: string;

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