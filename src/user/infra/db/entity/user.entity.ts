import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { BookmarkEntity as Bookmark } from 'src/bookmark/infra/db/entity/bookmark.entity';
import { MaxLength, MinLength } from 'class-validator';
import { UserRole, UserRoleEnum } from 'src/user/domain/types/userRole';
import { UserType, UserTypeEnum } from 'src/user/domain/types/userType';

@Entity('user')
export class UserEntity {
  @PrimaryColumn()
  @ApiProperty({ description: 'id' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: '이메일' })
  email: string;

  @Column()
  @MinLength(6)
  @MaxLength(30)
  @ApiProperty({ description: '비밀번호' })
  password: string;

  @Column({ default: '익명' })
  @MaxLength(20)
  @ApiProperty({ description: '별명' })
  nickname: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
  @ApiProperty({ description: '유저/매니저' })
  role: UserRole;

  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.BASIC })
  @ApiProperty({ description: '유저 가입 유형' })
  type: UserType;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks?: Bookmark[];

  @CreateDateColumn()
  @ApiProperty({ description: '가입날짜' })
  createdAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: '수정날짜' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword?(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword?(aPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(aPassword, this.password);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

export class ResponseUser extends OmitType(UserEntity, [
  'password',
  'role',
  'type',
] as const) {}
