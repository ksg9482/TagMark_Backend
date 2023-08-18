import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';
import { IUserRepository } from 'src/user/domain/repository/iuser.repository';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import { UserFactory } from 'src/user/domain/user.factory';
import { UserRole, UserType } from 'src/user/domain';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private userFactory: UserFactory,
  ) {}

  async findByEmail(inputEmail: string): Promise<User | null> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .select(`*`)
      .where('("user"."email" = :email)', { email: inputEmail })
      .limit(1)
      .getRawOne();

    if (!userEntity) {
      return null;
    }
    const { id, nickname, email, password, role, type } = userEntity;
    return this.userFactory.reconstitute(
      id,
      nickname,
      email,
      password,
      role,
      type,
    );
  }

  async findByEmailAndPassword(
    inputEmail: string,
    inputPassword: string,
  ): Promise<User | null> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .select(`*`)
      .where('("user"."email" = :email)', { email: inputEmail })
      .andWhere('("user"."password" = :password)', { password: inputPassword })
      .limit(1)
      .getRawOne();

    if (!userEntity) {
      return null;
    }
    const { id, nickname, email, password, role, type } = userEntity;
    return this.userFactory.reconstitute(
      id,
      nickname,
      email,
      password,
      role,
      type,
    );
  }

  createEntity(
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): UserEntity {
    const uuid = () => {
      const tokens = uuidV4().split('-');
      return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    };
    return this.userRepository.create({
      id: uuid(),
      email,
      password,
      nickname,
      role,
      type,
    });
  }
  async save(
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): Promise<User> {
    const userEntity = this.createEntity(email, nickname, password, role, type);
    await this.userRepository.save(userEntity);
    return this.userFactory.reconstitute(
      userEntity.id,
      userEntity.email,
      userEntity.nickname,
      userEntity.password,
      userEntity.role,
      userEntity.type,
    );
  }

  async update(id: string, item: any): Promise<any> {
    //어떻게 데이터를 넘겨줘야 합리적일까? 데이터는 바꿀 데이터만? 아니면 바뀐 데이터가 적용되서 오면 db에 저장?
    return await this.userRepository.update(id, item);
  }

  //모든 유저를 도메인 객체에 담아서 반환하는 메서드가 필요한가?
  async getAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    if (userEntities.length <= 0) {
      return [];
    }
    return userEntities.map((entity) => {
      return this.userFactory.reconstitute(
        entity.id,
        entity.nickname,
        entity.email,
        entity.password,
        entity.role,
        entity.type,
      );
    });
  }

  async get(inputId: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: inputId },
    });
    if (!userEntity) {
      return null;
    }
    const { id, nickname, email, password, role, type } = userEntity;
    return this.userFactory.reconstitute(
      id,
      nickname,
      email,
      password,
      role,
      type,
    );
  }

  async delete(id: string): Promise<any> {
    const userEntity = await this.userRepository.delete(id);
    return userEntity;
  }
}