import { IGenericRepository } from 'src/common/domain/repository/igeneric-repository';
import { User } from 'src/user/domain/user';
import { UserSaveDto } from './dtos/userSave.dto';
import { SaveDto } from 'src/user/infra/db/dto/save.dto';
import { UserEntity } from 'src/user/infra/db/entity/user.entity';

export interface IUserRepository {
  getAll: () => Promise<User[]>;

  get: (id: string) => Promise<User | null>;

  save: (item: UserSaveDto) => Promise<SaveDto>;
  // save: (item: UserEntity) => Promise<SaveDto>;

  update: (id: string, item: Partial<User>) => Promise<any>;

  delete: (id: string) => Promise<any>;
  findByEmail: (email: string) => Promise<User | null>;
  findByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<User | null>;
}
