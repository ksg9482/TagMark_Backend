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

    async getAllTags(): Promise<GetAllTagsOutputDto> {
        const tags = await this.tags.find()
        return { tags: tags }
    }



    //배열로 받으면 bulk로 넣는거 구현
    async createTag(userId: number, createTagInputDto: CreateTagInputDto): Promise<CreateTagOutputDto> {
        //책임을 분리해야 한다. 태그를 만든다. 태그를 검색한다. 북마크에 태그를 적용한다. 태그에 해당하는 북마크를 가져온다.
        //태그 검색&생성을 묶어서 함수화
        const tagCheck = await this.getTagsByNames(createTagInputDto.tag)[0]//await this.tags.findOne({ where: { tag: createTagInputDto.tag } })
        if (tagCheck) {
            return { tag: tagCheck }
        }
        const createdTag = await this.tags.save(
            this.tags.create({
                tag: createTagInputDto.tag,
            })
        );

        return { tag: createdTag }
    }

    //update로 변경
    async editTag(userId: number, tagId: number, editTagInputDto: EditTagInputDto): Promise<CreateTagOutputDto> {
        //책임을 분리해야 한다. 태그를 만든다. 태그를 검색한다. 북마크에 태그를 적용한다. 태그에 해당하는 북마크를 가져온다.
        //태그 검색&생성을 묶어서 함수화
        const tag = await this.tags.findOne({ where: { id: tagId } })
        const createdTag = await this.tags.save(
            this.tags.create({
                ...tag,
                tag: editTagInputDto.changeTag,
            })
        );

        return { tag: createdTag }
    }

    //조인테이블에서 해당 컬럼 지우면 된다. tagId는 dto로.
    async deleteTag(userId: number, bookmarkId: number, tagId: number) {
        const deleteTag = await this.tags.createQueryBuilder()
            .innerJoin('bookmarks_tags', 'bookmarkId')
            .where({ bookmarkId: bookmarkId, tagId: tagId })
        await this.tags.delete({ id: bookmarkId })
        return { message: 'Deleted' }
    }

    //북마크에 태그 추가.tagId는 컨트롤러에서 배열에 넣어줘야함
    //이거 검증해야함
    async attachTag(userId: number, bookmarkId: number, tags: Tag[]) {

        //const tagCheck = await this.tags.createQueryBuilder()
        //const tag = await this.tags.find()
        const arr = []
        tags.forEach(async (tag) => {
            //1. 입력된 태그들을 IN으로 일괄검색 -> 있는거 찾고 없는거 만들기 -> 태그배열생성
            //1-2. 태그배열로 조인테이블에 유무확인. 있는거 넘기고 태그배열로 없는 거 일괄생성.
            //2. sql문으로 하기. 서브쿼리+파라미터로 하면 대량처리 될지도? 
            const check = await this.bookmarksTags.findOne({ where: { bookmarkId: bookmarkId, tagId: tag.id } });
            if (check) {
                arr.push(check)
                return;
            }
            const attachTag = await this.bookmarksTags.save(this.bookmarksTags.create({
                bookmarkId: bookmarkId,
                tagId: tag.id
            }))
            arr.push(attachTag)
            console.log(attachTag)
        })
        return arr
    }

    async getTagsByIds(tagId: number | number[]) {
        if (!Array.isArray(tagId)) {
            tagId = [tagId]
        }
        /*
        tagId [1,3,5,8] 입력시
        SELECT "Tag"."id" AS "Tag_id", 
               "Tag"."tag" AS "Tag_tag", 
               "Tag"."createdAt" AS "Tag_createdAt", 
               "Tag"."updatedAt" AS "Tag_updatedAt" 
        FROM "tag" "Tag" 
        WHERE "Tag"."id" IN ($1, $2, $3, $4) 
        -- PARAMETERS: [1,3,5,8]
        */
        const tags = await this.tags.createQueryBuilder()
            .select()
            .whereInIds(tagId)
            .getMany()
        return { tags }
    }
    async getTagsByNames(tagName: string | string[]):Promise<Tag[]> {
        if (!Array.isArray(tagName)) {
            tagName = [tagName]
        }
        /*
        tagId ["여행","야시장"] 입력시
        SELECT "tag"."id" AS "tag_id", 
        "tag"."tag" AS "tag_tag", 
        "tag"."createdAt" AS "tag_createdAt", 
        "tag"."updatedAt" AS "tag_updatedAt" 
        FROM "tag" "tag" 
        WHERE "tag"."tag" 
        IN ($1, $2) 
        -- PARAMETERS: ["여행","야시장"]
        */
        const tags = await this.tags.createQueryBuilder("tag")
            .where("tag.tag IN (:...tags)", { "tags": tagName })
            .getMany()
        return tags
    }

    //DB에 해당 태그가 있는지. 필터로 판단. 필터되서 나온 문자열은 태그에 없는 것.
    //그 문자열만 태그 추가(IN). 그리고 조인테이블에 추가

    //
    tagToString(tags:Tag[]):string[] {
        const tagStrings:string[] = []
        const deepCopy = (obj) => {
            if (obj instanceof Object) {
                let result = new obj.constructor();
                Object.keys(obj).forEach(k => {
                    result[k] = deepCopy(obj[k]);
                })
                return result;
            }
            else if (obj instanceof Array) {
                let result = obj.map(element => deepCopy(element));
            }
            else return obj;
        }
        for(let tag of tags){
            let copy = deepCopy(tag)
            console.log(tag === copy)
            tagStrings.push(copy)
        }
        return tagStrings
    }
}
