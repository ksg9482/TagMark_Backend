import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataServices } from 'src/core/abstracts';
import { Repository } from 'typeorm';
import { User, Bookmark, Tag } from './model';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { UserRepository } from './repositorys/user.repository';

@Injectable()
export class PostgresqlDataServices 
implements DataServices, OnApplicationBootstrap 
{
    users: PostgresqlGenericRepository<User>;
    bookmarks: PostgresqlGenericRepository<Bookmark>;
    tags: PostgresqlGenericRepository<Tag>;

    constructor(
        //@InjectRepository(User)
        //private UserRepository: UserRepository,
        @InjectRepository(User)
        private UserRepository: Repository<User>,
        @InjectRepository(Bookmark)
        private BookmarkRepository: Repository<Bookmark>,
        @InjectRepository(Tag)
        private TagRepository: Repository<Tag>
    ) {}

    onApplicationBootstrap() {
        this.users = new PostgresqlGenericRepository<User>(this.UserRepository);
        this.bookmarks = new PostgresqlGenericRepository<Bookmark>(this.BookmarkRepository);
        this.tags = new PostgresqlGenericRepository<Tag>(this.TagRepository);
        console.log(this.users)
        console.log(this.UserRepository)
    }
}
