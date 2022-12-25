import { Injectable } from "@nestjs/common";
import { CreateBookmarkDto } from "src/controllers/dtos";
import { Bookmark } from "src/core/entities";

@Injectable()
export class BookmarkFactoryService {
    createNewBookmark(createBookmarkDto: CreateBookmarkDto) {
        const newBookmark = new Bookmark();
        newBookmark.url = createBookmarkDto.url;

        return newBookmark;
    }
}