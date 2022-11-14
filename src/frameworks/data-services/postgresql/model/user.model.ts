import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import * as bcrypt from "bcrypt"
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bookmark, Tag, Users_Tags } from "./";

export enum UserType {
    BASIC = 'BASIC',
    KAKAO = 'KAKAO',
    GOOGLE = 'GOOGLE'
}
export enum UserRole {
    USER = 'USER',
    MANAGER = 'MANAGER'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column({unique:true})
    @ApiProperty({ description: '이메일' })
    email: string;

    @Column({select:false})
    @ApiProperty({ description: '비밀번호' })
    password: string;

    @Column({default:'익명'})
    @ApiProperty({ description: '별명' })
    nickname: string;

    @Column({type:'enum', enum:UserRole, default:UserRole.USER})
    @ApiProperty({ description: '유저/매니저' })
    role: UserRole

    @Column({type:'enum', enum:UserType, default:UserType.BASIC})
    @ApiProperty({ description: '유저 가입 유형' })
    type: UserType

    @OneToMany(
        () => Bookmark,
        bookmark => bookmark.user
    )
    bookmarks:Bookmark[]

    @OneToMany(
        ()=>Users_Tags,
        users_tags => users_tags.tag
    )
    tags:Tag[]
    
    @CreateDateColumn()
    @ApiProperty({ description: '가입날짜' })
    createdAt: Date;

    @CreateDateColumn()
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword():Promise<void>{
        if(this.password){
            try {
                this.password = await bcrypt.hash(this.password, 10)
            } catch (error) {
                throw new InternalServerErrorException()
            }
        }
    }
    

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            return bcrypt.compare(aPassword, this.password);
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}