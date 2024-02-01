import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/domain/repository/user.repository';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import { UserFactory } from 'src/user/domain/user.factory';
import { UtilsService } from 'src/utils/utils.service';
import { UserSaveDto } from 'src/user/domain/repository/dtos/userSave.dto';
import { UserRole, UserRoleEnum } from 'src/user/domain/types/userRole';
import { UserType, UserTypeEnum } from 'src/user/domain/types/userType';
import { SaveDto } from '../dto/save.dto';
import { UpdateDto } from '../dto/update.dto';
import { DeleteDto } from '../dto/delete.dto';
import { GetDto } from '../dto/get.dto';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private userFactory: UserFactory,
    private utilsService: UtilsService,
  ) {}

  async findByEmail(inputEmail: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOneBy({
      email: inputEmail,
    });

    if (!userEntity) {
      return null;
    }

    return this.userFactory.reconstitute(
      userEntity.id,
      userEntity.email,
      userEntity.nickname,
      userEntity.password,
      userEntity.role,
      userEntity.type,
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
    return SaveDto.from(userEntity);
  }

  async update(id: string, item: Partial<User>): Promise<any> {
    const userentity = this.userRepository.create(item);

    await this.userRepository.manager.transaction(
      'REPEATABLE READ',
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(UserEntity, id, userentity);
      },
    );
    return new UpdateDto(userentity);
  }

  async get(inputId: string): Promise<GetDto | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: inputId },
    });
    if (!userEntity) {
      return null;
    }
    const { id, nickname, email, password, role, type } = userEntity;
    return new GetDto(userEntity);
    // return this.userFactory.reconstitute(
    //   id,
    //   email,
    //   nickname,
    //   password,
    //   role,
    //   type,
    // );
  }

  async delete(id: string): Promise<DeleteDto> {
    const userentity = this.userRepository.create({ id: id });
    await this.userRepository.delete(userentity.id);
    return new DeleteDto(userentity);
  }
}
