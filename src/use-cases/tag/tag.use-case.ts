import { Inject } from "@nestjs/common";
import { DataServices } from "src/core/abstracts";
import { CreateTagDto, CreateTagResponseDto, EditTagDto } from "src/controllers/dtos";
import { GetSearchTagsDto } from "src/controllers/dtos/tag/get-search-tags.dto copy";
import { Bookmark, Tag } from "src/core/entities";


export class TagUseCases {

    constructor(
        @Inject(DataServices)
        private dataService: DataServices,
    ) { }

    async getAllTags(): Promise<Tag[]> {
        const tags = await this.dataService.tags.getAll()
        return tags;
    };

    async createTag(userId: number, createTagDto: CreateTagDto): Promise<Tag> {
        //책임을 분리해야 한다. 태그를 만든다. 태그를 검색한다. 북마크에 태그를 적용한다. 태그에 해당하는 북마크를 가져온다.
        //태그 검색&생성을 묶어서 함수화
        const tagCheck = await this.getTagsByNames(createTagDto.tag)//await this.tags.findOne({ where: { tag: createTagInputDto.tag } })
        if (tagCheck) {
            return tagCheck[0]
        }
        // const createdTag = await this.dataService.tags.create(
        //     this.tags.create({
        //         tag: createTagInputDto.tag,
        //     })
        // );
        const createdTag = await this.dataService.tags.create(createTagDto);


        return createdTag
    }

    async getTagsByNames(tagName: string | string[]): Promise<Tag[]> {
        if (!Array.isArray(tagName)) {
            tagName = [tagName]
        }
        const tags = await this.tagFindOrCreate(tagName)
        return tags;
    };

    async tagFindOrCreate(tagNames: string[]) {
        //find
        let tags: Tag[] = await this.dataService.tags.findByTagNames(tagNames)

        const tagFilter = this.tagFilter(tags, tagNames)
        if (tagFilter) {
            //create
            const createTags = tagFilter.map(tag => { return this.dataService.tags.createForm({ tag: tag }) })
            const insertBulk = await this.dataService.tags.insertBulk(createTags)

            tags = [...tags, ...createTags];
        };

        return tags;
    };
    
    async attachTag(userId: number, bookmarkId: number, tags: Tag[]) {

        //const tagCheck = await this.tags.createQueryBuilder()
        //const tag = await this.tags.find()
        const attach = await this.dataService.tags.attachTag(userId,bookmarkId,tags)
        return attach
    }

    //내꺼 북마크에 있는 태그 바꾸는 건 이미 있다. 이건 태그 그 자체 변경. 이거 공개해야 하는가?
    async editTag(userId: number, tagId: number, editTagInputDto: EditTagDto) {
        //바꾼태그가 이미 있음, 없어서 만들어야 함 구분
        const tag = await this.dataService.tags.get(tagId)
        const createdTag = await this.dataService.tags.update(tagId,{tag:editTagInputDto.changeTag})
        const tagCheck = await this.getTagsByNames(editTagInputDto.changeTag)//await this.tags.findOne({ where: { tag: createTagInputDto.tag } })
        if (tagCheck) {
            return tagCheck[0]
        }
        return { message: 'Updated' }
    }



    


    async detachTag(userId: number, bookmarkId: number, tagId: number | number[]) {
        if (!Array.isArray(tagId)) {
            tagId = [tagId]
        }
        const deletedTag = await this.dataService.tags.detachTag(bookmarkId, tagId)
        return { message: 'Deleted', deleteCount: deletedTag.affected }
    }

    async getTagsByIds(tagId: number | number[]):Promise<Tag[]> {
        if (!Array.isArray(tagId)) {
            tagId = [tagId]
        }
        const tags = await this.dataService.tags.getTagsByIds(tagId)
        return tags
    };

    async getUserAllTags(userId: number): Promise<Tag[]> {
        const tags = await this.dataService.tags.getUserAllTags(userId)
        const countForm = tags.map((tag)=>{
            return {...tag, count:Number(tag['count'])}
        })
        //console.log(countForm)
        return countForm
    };

    //반환이 북마크면 북마크로 가는게 좋지 않을까?
    //or문 개선 필요. 북마크 태그 전부가 나오는게 아니라 태그에 해당하는 것만 나와서 일부만 나옴
    async getTagAllBookmarksOR(userId: number, tags: string[], page: GetSearchTagsDto) {
        const limit = page.getLimit()
        const offset = page.getOffset()
        const bookmarks = await this.dataService.tags.getTagSeatchOR(
            userId, tags, 
            {
                take: limit,
                skip: offset
            }
            );
        return bookmarks;
    };

    async getTagAllBookmarksAND(userId: number, tags: string[], page: GetSearchTagsDto) {
        const limit = page.getLimit()
        const offset = page.getOffset()
        const bookmarks = await this.dataService.tags.getTagSearchAND(
            userId, tags, 
            {
                take: limit,
                skip: offset
            }
            );
        return bookmarks;
    };
    
    protected tagFilter(finedTagArr: Tag[], inputTagArr: string[]) {
        const tagArr = finedTagArr.map((tag) => {
            return tag.tag;
        });
        return inputTagArr.filter(tag => !tagArr.includes(tag))
    };
}