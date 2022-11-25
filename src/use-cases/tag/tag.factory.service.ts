import { Injectable } from "@nestjs/common";
import { CreateTagDto } from "src/core/dtos";
import { Tag } from "src/core/entities";

@Injectable()
export class TagFactoryService {
    createNewTag(createTagDto: CreateTagDto) {
        const newTag = new Tag();
        newTag.tag = createTagDto.tag;

        return newTag;
    }
}