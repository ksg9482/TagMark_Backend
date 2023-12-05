import { IGenericRepository } from 'src/common/domain/repository/igeneric-repository';
import { User } from 'src/user/domain/user';
import { UserSaveDto } from './dtos/userSave.dto';

export interface IUserRepository {
  getAll: () => Promise<User[]>;

  get: (id: string) => Promise<User | null>;

  save: (item: UserSaveDto) => Promise<any>;

  update: (id: string, item: Partial<User>) => Promise<any>;

  delete: (id: string) => Promise<any>;
  findByEmail: (email: string) => Promise<User | null>;
  findByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<User | null>;
}
