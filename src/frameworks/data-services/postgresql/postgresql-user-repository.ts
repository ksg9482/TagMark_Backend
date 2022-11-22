import { Repository } from 'typeorm'
import { GenericRepository } from "src/core";
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { UserRepository } from 'src/core/abstracts/user-repository.abstract';
import { User } from './model';

@Injectable()
export class PostgresqlUserRepository extends PostgresqlGenericRepository<User> implements UserRepository<User>  {
    userRepository: Repository<User>;
    constructor(
        @Inject(Repository<User>)
        repository: Repository<User>
    ){
        super(repository);
        this.userRepository = repository;
    };
    async checkPassword(password: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    };
    async getByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({where:{email:email}});
    };

    async update(id: number, item: User): Promise<any> {
        return await this.userRepository.update(id, item);
    };

    async get(id: number): Promise<User> {
        return this.userRepository.findOne({where:{id:id}})
    }

    
    
}