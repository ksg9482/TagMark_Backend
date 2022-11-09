import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "./tag.entity";

@Entity()
export class SimilarTag {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @ManyToOne(
        () => Tag,
        Tag => Tag.similarTags,
        {onDelete:"CASCADE"},
    )
    tag:Tag;

    @JoinColumn({
        name:'tag_id',
        referencedColumnName:"id"
    })
    tag_id:number;

    @Column()
    @ApiProperty({ description: '태그' })
    similar_tag: string;
    
    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({type: "timestamp"})
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}