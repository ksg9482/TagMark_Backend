import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlGenericRepository } from './postgresql-generic-repository';
import { UserRepository } from 'src/core/abstracts';
import { User } from './model';

@Injectable()
export class PostgresqlUserRepository extends PostgresqlGenericRepository<User> implements UserRepository  {
    userRepository: Repository<User>;
    constructor(
        @Inject(Repository<User>)
        repository: Repository<User>
    ){
        super(repository);
        this.userRepository = repository;
    };
    
    async getByEmail(email: string): Promise<User> {
        return await this.userRepository.createQueryBuilder("user").select(`*`).where('("user"."email" = :email)',{email:email}).limit(1).getRawOne() as User
    };

    async create(item: Partial<User>): Promise<User> {
        return await this.userRepository.save(this.userRepository.create(item))
    }

    async update(id: number, item: User): Promise<any> {
        return await this.userRepository.update(id, item);
    };

    async get(id: number): Promise<User> {
        return await this.userRepository.findOne({where:{id:id}})
    }

    
    
}