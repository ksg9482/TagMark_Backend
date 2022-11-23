import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataServices } from 'src/core/abstracts';
import { Repository } from 'typeorm';
import { User, Bookmark, Tag } from './model';
import { PostgresqlBookmarkRepository } from './postgresql-bookmark-repository';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { PostgresqlTagRepository } from './postgresql-tag-repository';
import { PostgresqlUserRepository } from './postgresql-user-repository';


@Injectable()
export class PostgresqlDataServices 
implements DataServices, OnApplicationBootstrap 
{
    users: PostgresqlUserRepository;//PostgresqlGenericRepository<User>;
    bookmarks: PostgresqlBookmarkRepository;//PostgresqlGenericRepository<Bookmark>;
    tags: PostgresqlTagRepository;

    constructor(
        @InjectRepository(User)
        private UserRepository: Repository<User>,
        @InjectRepository(Bookmark)
        private BookmarkRepository: Repository<Bookmark>,
        @InjectRepository(Tag)
        private TagRepository: Repository<Tag>
    ) {}

    
    onApplicationBootstrap() { //모든 모듈이 초기화된 후 연결을 수신 대기하기 전에 호출
        this.users = new PostgresqlUserRepository(this.UserRepository);//new PostgresqlGenericRepository<User>(this.UserRepository);
        this.bookmarks = new PostgresqlBookmarkRepository(this.BookmarkRepository);
        this.tags = new PostgresqlTagRepository(this.TagRepository);
        
    }
}
