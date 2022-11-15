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

    getAll(): Promise<T[]> {
        console.log('getAll')
        return this._repository.find()
    }

    get(id: any): Promise<T> {
        return this._repository.findOne(id)
    }

    create(item: T): Promise<T> {
        console.log('호출')
        console.log(item)
        return this._repository.save(this._repository.create(item))
    }

    update(id: number, item: T) {
        return this._repository
    }

    delete(id: any) {
        return this._repository.delete(id)
    }
}