import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Bookmark } from "./bookmark.entity";

@Entity()
export class Domain {

    id: number;

    domain: string;
    
    createdAt: Date;

    updatedAt: Date;

}