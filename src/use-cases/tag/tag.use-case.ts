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
        const tagCheck = await this.getTagsByNames(createTagDto.tag)
        if (tagCheck) {
            return tagCheck[0]
        }
        
        const createdTag = await this.dataService.tags.create(createTagDto);

        return createdTag;
    }

    async getTagsByNames(tagName: string | string[]): Promise<Tag[]> {
        if (!Array.isArray(tagName)) {
            tagName = [tagName]
        }
        const tags = await this.tagFindOrCreate(tagName)
        return tags;
    };

    protected async tagFindOrCreate(tagNames: string[]) {
        let tags: Tag[] = await this.dataService.tags.findByTagNames(tagNames)

        const tagFilter = this.tagFilter(tags, tagNames)
        if (tagFilter) {
            const createTags = tagFilter.map(tag => { return this.dataService.tags.createForm({ tag: tag }) })
            const insertBulk = await this.dataService.tags.insertBulk(createTags)

            tags = [...tags, ...createTags];
        };

        return tags;
    };
    
    async attachTag(userId: number, bookmarkId: number, tags: Tag[]) {
        const attach = await this.dataService.tags.attachTag(userId,bookmarkId,tags)
        return attach
    }

    async editTag(userId: number, tagId: number, editTagInputDto: EditTagDto) {
        const tag = await this.dataService.tags.get(tagId)
        const createdTag = await this.dataService.tags.update(tagId,{tag:editTagInputDto.changeTag})
        const tagCheck = await this.getTagsByNames(editTagInputDto.changeTag)
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
        return countForm
    };

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