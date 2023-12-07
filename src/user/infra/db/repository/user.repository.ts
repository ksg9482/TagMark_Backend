import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRepository } from 'src/user/domain/repository/iuser.repository';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import { UserFactory } from 'src/user/domain/user.factory';
import { UtilsService } from 'src/utils/utils.service';
import { UserSaveDto } from 'src/user/domain/repository/dtos/userSave.dto';
import { UserRole } from 'src/user/domain/types/userRole';
import { UserType } from 'src/user/domain/types/userType';
import { SaveUserResponseDto } from '../dto/saveUserResp.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private userFactory: UserFactory,
    private utilsService: UtilsService,
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
      email,
      nickname,
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
      email,
      nickname,
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
    return this.userRepository.create({
      id: this.utilsService.getUuid(),
      email,
      password,
      nickname,
      role,
      type,
    });
  }
  async save(item: UserSaveDto) {
    const { email, nickname, password, role, type } = item;

    const userEntity = this.createEntity(email, nickname, password, role, type);

    await this.userRepository.save(userEntity);
    // return this.userFactory.reconstitute(
    //   userEntity.id,
    //   userEntity.email,
    //   userEntity.nickname,
    //   userEntity.password,
    //   userEntity.role,
    //   userEntity.type,
    // );
    const dto = SaveUserResponseDto.from(userEntity.id);
    return dto;
  }

  async update(id: string, item: User): Promise<any> {
    const userentity = this.userRepository.create(item);
    return await this.userRepository.update(id, userentity);
  }

  async getAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    if (userEntities.length <= 0) {
      return [];
    }
    return userEntities.map((entity) => {
      return this.userFactory.reconstitute(
        entity.id,
        entity.email,
        entity.nickname,
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
      email,
      nickname,
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
