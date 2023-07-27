import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRepository } from 'src/cleanArchitecture/user/domain/repository/iuser.repository';
import { User } from 'src/cleanArchitecture/user/domain/user';
import { UserEntity } from 'src/cleanArchitecture/user/infra/db/entity/user.entity';
import { UserFactory } from 'src/cleanArchitecture/user/domain/user.factory';
import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';

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

  async create(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): Promise<User> {
    const user = new UserEntity();
    user.id = id;
    user.email = email;
    user.nickname = nickname;
    user.password = password;
    user.role = role;
    user.type = type;
    //save와 create는 분리해도 되는 로직.
    return this.userFactory.reconstitute(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
    );
    // return await this.userRepository.save(this.userRepository.create(item));
  }

  async save(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): Promise<User> {
    const user = new UserEntity();
    user.id = id;
    user.email = email;
    user.nickname = nickname;
    user.password = password;
    user.role = role;
    user.type = type;

    return this.userFactory.reconstitute(
      user.id,
      user.email,
      user.nickname,
      user.password,
      user.role,
      user.type,
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
