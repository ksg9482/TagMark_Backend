import { User } from 'src/user/domain/user';
import { UserSaveDto } from './dtos/userSave.dto';
//잘못된 의존성 방향. domain에 선언하고 infra에서 가져다 써야 할까? 정작 쓰는 곳은 infra인데 domain에서 관리하나?
import { SaveDto } from 'src/user/infra/db/dto/save.dto';
import { UpdateDto } from 'src/user/infra/db/dto/update.dto';
import { GetDto } from 'src/user/infra/db/dto/get.dto';

export abstract class UserRepository {
  get: (id: string) => Promise<GetDto | null>;
  save: (item: UserSaveDto) => Promise<SaveDto>;
  update: (id: string, item: Partial<User>) => Promise<UpdateDto>;
  delete: (id: string) => Promise<any>;
  findByEmail: (email: string) => Promise<User | null>;
}
