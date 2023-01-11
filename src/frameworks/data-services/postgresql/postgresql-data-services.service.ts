import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataServices } from 'src/core/abstracts';
import { Repository } from 'typeorm';
import { User, Bookmark, Tag } from './model';
import { PostgresqlBookmarkRepository } from './postgresql-bookmark-repository';
import { PostgresqlTagRepository } from './postgresql-tag-repository';
import { PostgresqlUserRepository } from './postgresql-user-repository';


@Injectable()
export class PostgresqlDataServices
    implements DataServices, OnApplicationBootstrap {
    users: PostgresqlUserRepository;
    bookmarks: PostgresqlBookmarkRepository;
    tags: PostgresqlTagRepository;

    constructor(
        @InjectRepository(User)
        private UserRepository: Repository<User>,
        @InjectRepository(Bookmark)
        private BookmarkRepository: Repository<Bookmark>,
        @InjectRepository(Tag)
        private TagRepository: Repository<Tag>
    ) { }


    onApplicationBootstrap() {
        this.users = new PostgresqlUserRepository(this.UserRepository);
        this.bookmarks = new PostgresqlBookmarkRepository(this.BookmarkRepository);
        this.tags = new PostgresqlTagRepository(this.TagRepository);

    }
}
