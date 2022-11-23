import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { TagRepository } from 'src/core/abstracts';
import { Tag } from './model';

@Injectable()
export class PostgresqlTagRepository extends PostgresqlGenericRepository<Tag> implements TagRepository  {
    TagRepository: Repository<Tag>;
    constructor(
        @Inject(Repository<Tag>)
        repository: Repository<Tag>
    ){
        super(repository);
        this.TagRepository = repository;
    };

    async create(item: Partial<Tag>): Promise<Tag> {
        return await this.TagRepository.save(this.TagRepository.create(item))
    }

    async update(id: number, item: Tag): Promise<any> {
        return await this.TagRepository.update(id, item);
    };

    async getAll(): Promise<Tag[]> {
        return await this.TagRepository.find()
    }

    async getUserTag(userId: number, TagId:number): Promise<Tag> {
        return await this.TagRepository.findOne({where:{id:TagId}})
    };

}