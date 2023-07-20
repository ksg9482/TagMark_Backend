import { IGenericRepository } from 'src/cleanArchitecture/common/domain/repository/igeneric-repository';
import { User } from 'src/cleanArchitecture/user/domain/user';

export interface IUserRepository extends IGenericRepository<User> {
  findByEmail: (email: string) => Promise<User>;
  getByEmail: (email: string) => Promise<User>;
  findByEmailAndPassword: (email: string, password: string) => Promise<User>;
  findBySignupVerifyToken: (signupVerifyToken: string) => Promise<User>;
}
