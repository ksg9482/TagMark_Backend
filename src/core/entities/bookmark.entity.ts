import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Bookmark {
    
    id: number;

    url: string;

    tags: any[];
    
    userId: number;
    
    createdAt: Date;

    updatedAt: Date;

}