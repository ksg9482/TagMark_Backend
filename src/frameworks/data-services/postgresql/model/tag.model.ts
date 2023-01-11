import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bookmark, Bookmarks_Tags } from "./";
import { Tag as TagAbstract } from "src/core"


@Entity()
export class Tag implements TagAbstract {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'id' })
    id: number;

    @Column({ unique: true })
    @ApiProperty({ description: '태그' })
    tag: string;

    @OneToMany(
        () => Bookmarks_Tags,
        bookmarks_tags => bookmarks_tags.bookmark,
        { onDelete: "CASCADE" }
    )
    bookmarks?: Bookmark[]

    @CreateDateColumn({ type: "timestamp" })
    @ApiProperty({ description: '생성날짜' })
    createdAt: Date;

    @CreateDateColumn({ type: "timestamp" })
    @ApiProperty({ description: '수정날짜' })
    updatedAt: Date;

}