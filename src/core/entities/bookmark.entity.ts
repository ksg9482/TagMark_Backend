import { Tag } from "./tag.entity";

export class Bookmark {
    
    id: number;

    url: string;

    tags: Tag[];
    
    userId: number;
    
    createdAt: Date;

    updatedAt: Date;

}