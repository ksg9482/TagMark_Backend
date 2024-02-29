import { User } from 'src/user/domain/user';
import { SaveDto } from 'src/user/infra/db/dto/save.dto';
import { UpdateDto } from 'src/user/infra/db/dto/update.dto';
import { GetDto } from 'src/user/infra/db/dto/get.dto';
import { UserRole } from '../types/userRole';
import { UserType } from '../types/userType';
import { DeleteDto } from 'src/user/infra/db/dto/delete.dto';

export abstract class UserRepository {
  get: (id: string) => Promise<GetDto | null>;
  save: (
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) => Promise<SaveDto>;
  update: (id: string, item: Partial<User>) => Promise<UpdateDto>;
  delete: (id: string) => Promise<DeleteDto>;
  findByEmail: (email: string) => Promise<GetDto | null>;
}
