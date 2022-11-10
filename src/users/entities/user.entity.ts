import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Bookmark } from "src/bookmarks/entities/bookmark.entity";
enum UserType {
    BASIC = 'BASIC',
    KAKAO = 'KAKAO',
    GOOGLE = 'GOOGLE'
}
enum UserRole {
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

    @Column()
    @ApiProperty({ description: '비밀번호' })
    password: string;

    @Column()
    @ApiProperty({ description: '별명' })
    nickname: string;

    @Column({type:'enum', enum:UserRole})
    @ApiProperty({ description: '유저/매니저' })
    role: UserRole

    @Column({type:'enum', enum:UserType})
    @ApiProperty({ description: '유저 가입 유형' })
    type: UserType

    @OneToMany(
        () => Bookmark,
        bookmark => bookmark.user
    )
    bookmarks:Bookmark[]
    
    @CreateDateColumn()
    @ApiProperty({ description: '가입날짜' })
    createdAt: Date;

    @CreateDateColumn()
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;


//서비스로 옮기고 거기서 불러오기 -> 그러면 의존방향이 옳지 않음.
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