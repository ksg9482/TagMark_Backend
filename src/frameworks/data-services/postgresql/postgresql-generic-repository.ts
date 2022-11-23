import { Repository } from 'typeorm'
import { GenericRepository } from "src/core";
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PostgresqlGenericRepository<T> implements GenericRepository<T> {
    private _repository: Repository<T>;

    constructor(
        @Inject(Repository<T>)
        repository: Repository<T>
        ) {
        this._repository = repository;
    }

    async getAll(): Promise<T[]> {
        return await this._repository.find()
    }

    async get(id: any): Promise<T> {
        return await this._repository.findOne(id)
    }

    async create(item: T): Promise<T> {
        return await this._repository.save(this._repository.create(item))
    }

    async update(id: number, item: T) {
        
    }

    async delete(id: any) {
        return await this._repository.delete(id)
    }
}