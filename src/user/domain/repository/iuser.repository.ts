import { User } from 'src/user/domain/user';
import { UserSaveDto } from './dtos/userSave.dto';
import { SaveDto } from 'src/user/infra/db/dto/save.dto';
import { UpdateDto } from 'src/user/infra/db/dto/update.dto';

export interface IUserRepository {
  get: (id: string) => Promise<User | null>;
  save: (item: UserSaveDto) => Promise<SaveDto>;
  update: (id: string, item: Partial<User>) => Promise<UpdateDto>;
  delete: (id: string) => Promise<any>;
  findByEmail: (email: string) => Promise<User | null>;
  findByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<User | null>;
}
