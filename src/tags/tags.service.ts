import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
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
    //태그 네임이 들어오면 그거에 해당하는 id
    async deleteTag(userId: number, bookmarkId: number, tagId: number | number[]) {
        if (!Array.isArray(tagId)) {
            tagId = [tagId]
        }
        // const deleteTag = await this.tags.createQueryBuilder()
        //     .innerJoin('bookmarks_tags', 'bookmarkId')
        //     .where({ bookmarkId: bookmarkId, tagId: tagId })
        const deletedTag = await this.bookmarksTags.createQueryBuilder("bookmarks_tags")
        .delete()
        .from("bookmarks_tags", "bookmarks_tags")
        .where(`bookmarks_tags."bookmarkId" = ${bookmarkId} AND bookmarks_tags."tagId" IN (${tagId})`)
        .execute()
        //await this.tags.delete({ id: bookmarkId })
        return { message: 'Deleted', deleteCount:deletedTag.affected }
    }

    //북마크에 태그 추가.tagId는 컨트롤러에서 배열에 넣어줘야함
    //이거 개선. IN으로 작동하게
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
    async getTagsByNames(tagName: string | string[]): Promise<Tag[]> {
        if (!Array.isArray(tagName)) {
            tagName = [tagName]
        }
        const tags = await this.tagFindOrCreate(tagName)
        return tags
    }

    //DB에 해당 태그가 있는지. 필터로 판단. 필터되서 나온 문자열은 태그에 없는 것.
    //그 문자열만 태그 추가(IN). 그리고 조인테이블에 추가

    async getAlluserTags(userId: number) {
        const tags = await this.tags.createQueryBuilder('tag')
            .select(`tag.*`)
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId}`)
            .getRawMany()
        return { tags: tags }
    }

    //반환이 북마크면 북마크로 가는게 좋지 않을까?
    async getTagAllBookmarksOR(userId: number, tags: Array<string>) {
        const bookmarks: Bookmark[] = await this.tags.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} and ("tag"."tag" in (${tags}))`)
            .groupBy(`bookmark.id`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .getRawMany()
        return ({ bookmarks: bookmarks })
        /*
        SELECT "bookmark".*,
array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag")) AS "tags"
FROM "tag" "tag" 
LEFT JOIN "bookmarks_tags" "bookmarks_tags" ON "bookmarks_tags"."tagId" = "tag"."id"  
LEFT JOIN "bookmark" "bookmark" ON "bookmark"."id" = "bookmarks_tags"."bookmarkId" 
WHERE "userId" = 1 and ("tag"."tag" in ('여행','야시장'))
GROUP BY "bookmark"."id" 
ORDER BY bookmark."createdAt" DESC
        */
    }
    async getTagAllBookmarksAND(userId: number, tags: Array<string>) {
        const getTagAllBookmarksANDInputDto = ['여행', '야시장']
        const bookmarks: Bookmark[] = await this.tags.createQueryBuilder('tag')
            .select(`bookmark.*`)
            .addSelect(`array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag"))`, 'tags')
            .leftJoin(`bookmarks_tags`, `bookmarks_tags`, `bookmarks_tags."tagId" = tag.id`)
            .leftJoin(`bookmark`, `bookmark`, `bookmark.id = bookmarks_tags."bookmarkId"`)
            .where(`bookmark."userId" = ${userId} and ("tag"."tag" in (${tags}))`)
            .groupBy(`bookmark.id`)
            .having(`count("bookmark"."id") > ${getTagAllBookmarksANDInputDto.length - 1}`)
            .orderBy(`bookmark."createdAt"`, 'DESC')
            .getRawMany()
        return ({ bookmarks: bookmarks })
        /*
        and문 having으로 구분. 태그수랑 북마크 총합수랑 비교
        
        SELECT "bookmark".*,
        array_agg(json_build_object('id', "tag"."id",'tag', "tag"."tag")) AS "tags"
        FROM "tag" "tag" 
        LEFT JOIN "bookmarks_tags" "bookmarks_tags" ON "bookmarks_tags"."tagId" = "tag"."id"  
        LEFT JOIN "bookmark" "bookmark" ON "bookmark"."id" = "bookmarks_tags"."bookmarkId" 
        WHERE "userId" = 1 and ("tag"."tag" in ('여행','야시장'))
        GROUP BY "bookmark"."id"
        having count("bookmark"."id") > 1
        ORDER BY bookmark."createdAt" DESC
        */
    }

    async tagFindOrCreate(tagNames: string[]) {
        //find
        let tags:Tag[] = await this.tags.createQueryBuilder("tag")
            .where("tag.tag IN (:...tags)", { "tags": tagNames })
            .getMany();

        const tagFilter = this.tagFilter(tags, tagNames)
        if (tagFilter) {
            //create
            const createTags = tagFilter.map(tag => { return this.tags.create({ tag: tag }) })
            await this.tags.createQueryBuilder()
                .insert()
                .into('tag')
                .values(createTags)
                .execute()

            tags = [...tags, ...createTags]
        }

        return tags
    }

    tagFilter (finedTagArr:Tag[], inputTagArr:string[]) {
        const tagArr = finedTagArr.map((tag) => {
            return tag.tag;
        });
        return inputTagArr.filter(tag => !tagArr.includes(tag))
    }

    tagToString(tags: Tag[]): string[] {
        const tagStrings: string[] = []
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
        for (let tag of tags) {
            let copy = deepCopy(tag)
            tagStrings.push(copy)
        }
        return tagStrings
    }
}
