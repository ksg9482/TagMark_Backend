import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "./tag.entity";
import { User } from "src/users/entities/user.entity";

@Entity() 
export class Users_Tags {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @ManyToOne(
        () => User,
        user => user.tags,
        {onDelete:"CASCADE"}
    )
    user:User

    @ManyToOne(
        () => Tag,
        tag => tag.users,
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