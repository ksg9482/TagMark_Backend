import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/domain/repository/user.repository';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';
import { UtilsService } from 'src/utils/utils.service';
import { UserRole } from 'src/user/domain/types/userRole';
import { UserType } from 'src/user/domain/types/userType';
import { SaveDto } from '../dto/save.dto';
import { UpdateDto } from '../dto/update.dto';
import { DeleteDto } from '../dto/delete.dto';
import { GetDto } from '../dto/get.dto';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private utilsService: UtilsService,
  ) {}

  async findByEmail(inputEmail: string): Promise<GetDto | null> {
    const userEntity = await this.userRepository.findOneBy({
      email: inputEmail,
    });

    if (userEntity === null) {
      return null;
    }

    return new GetDto(userEntity);
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
  async save(
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) {
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

  async get(id: string): Promise<GetDto | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!userEntity) {
      return null;
    }
    return new GetDto(userEntity);
  }

  async delete(id: string): Promise<DeleteDto> {
    const userentity = this.userRepository.create({ id: id });
    await this.userRepository.delete(userentity.id);
    return new DeleteDto(userentity);
  }
}
