import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Bookmark } from "./bookmark.entity";

@Entity()
export class Domain {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column({unique:true})
    @ApiProperty({ description: 'URL 도메인' })
    domain: string;

    @OneToMany(
        ()=>Bookmark,
        path => path.domain
    )
    paths:Bookmark[]
    
    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}