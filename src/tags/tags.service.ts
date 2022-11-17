import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagInputDto, CreateTagOutputDto } from './dtos/create-tag.dto';
import { EditTagInputDto } from './dtos/edit-tag.dto copy';
import { GetAllTagsOutputDto } from './dtos/get-all-tags.dto';
import { Bookmarks_Tags } from './entities/bookmarks_tags.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tags: Repository<Tag>,
        @InjectRepository(Bookmarks_Tags)
        private readonly bookmarksTags: Repository<Bookmarks_Tags>,
    ) { }

    async getAllTags():Promise<GetAllTagsOutputDto> {
        const tags = await this.tags.find()
        return {tags: tags}
    }

    

    //배열로 받으면 bulk로 넣는거 구현
    async createTag(userId:number, createTagInputDto: CreateTagInputDto): Promise<CreateTagOutputDto> {
        //책임을 분리해야 한다. 태그를 만든다. 태그를 검색한다. 북마크에 태그를 적용한다. 태그에 해당하는 북마크를 가져온다.
        //태그 검색&생성을 묶어서 함수화
        const tagCheck = await this.tags.findOne({where:{tag:createTagInputDto.tag}})
        if(tagCheck) {
            return { tag: tagCheck }
        }
        const createdTag = await this.tags.save(
            this.tags.create({
                tag:createTagInputDto.tag,
            })
        );
        
        return { tag: createdTag }
    }

    //update로 변경
    async editTag(userId:number, tagId:number, editTagInputDto:EditTagInputDto): Promise<CreateTagOutputDto> {
        //책임을 분리해야 한다. 태그를 만든다. 태그를 검색한다. 북마크에 태그를 적용한다. 태그에 해당하는 북마크를 가져온다.
        //태그 검색&생성을 묶어서 함수화
        const tag = await this.tags.findOne({where:{id:tagId}})
        const createdTag = await this.tags.save(
            this.tags.create({
                ...tag,
                tag:editTagInputDto.changeTag,
            })
        );
        
        return { tag: createdTag }
    }

    //조인테이블에서 해당 컬럼 지우면 된다. tagId는 dto로.
    async deleteTag(userId: number, bookmarkId:number, tagId:number) {
        const deleteTag = await this.tags.createQueryBuilder()
        .innerJoin('bookmarks_tags','bookmarkId')
        .where({bookmarkId:bookmarkId, tagId:tagId})
        await this.tags.delete({id:bookmarkId})
        return {message: 'Deleted'}
    }

    //북마크에 태그 추가.tagId는 컨트롤러에서 배열에 넣어줘야함
    //이거 검증해야함
    async attachTag(userId: number, bookmarkId:number,tags:Tag[]) {
        
        //const tagCheck = await this.tags.createQueryBuilder()
        //const tag = await this.tags.find()
        const attachTag = await this.bookmarksTags.save(this.bookmarksTags.create({
            bookmarkId:bookmarkId,
            tagId:tags[0].id
        }))
    }
}
