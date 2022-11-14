import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Domain } from "./domain.entity";
import { Tag } from "src/tags/entities/tag.entity";
import { Bookmarks_Tags } from "src/tags/entities/bookmarks_tags.entity";

@Entity()
export class Bookmark {
    
    id: number;

    domain: Domain

    path: string;

    //user_id: number;

    //tags:Tag[]
    
    createdAt: Date;

    updatedAt: Date;

}