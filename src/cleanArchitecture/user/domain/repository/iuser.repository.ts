import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';
import { User } from 'src/cleanArchitecture/user/domain/user';
import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';

export interface IUserRepository extends IGenericRepository<User> {
  save: (
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ) => Promise<User>;
  findByEmail: (email: string) => Promise<User | null>;
  findByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<User | null>;
}
