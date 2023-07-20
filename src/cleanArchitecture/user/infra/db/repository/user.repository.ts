import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from 'src/use-cases/bookmark/bookmark.pagination';
import { ITagRepository } from 'src/cleanArchitecture/tag/domain/repository/itag.repository';
import { Tag } from 'src/cleanArchitecture/tag/domain/tag';
import { Bookmarks_Tags } from 'src/frameworks/data-services/postgresql/model/bookmarks_tags.model';
import { Bookmark } from 'src/cleanArchitecture/bookmark/domain/bookmark';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/cleanArchitecture/tag/infra/db/entity/tag.entity';
import { TagFactory } from 'src/cleanArchitecture/tag/domain/tag.factory';
import { IUserRepository } from 'src/cleanArchitecture/user/domain/repository/iuser.repository';
import { User } from 'src/cleanArchitecture/user/domain/user';
import { UserEntity } from 'src/cleanArchitecture/user/infra/db/entity/user.entity';
import { UserFactory } from 'src/cleanArchitecture/user/domain/user.factory';

@Injectable()
export class UserRepository implements IUserRepository {
  //   TagRepository: Repository<Tag>;
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private userFactory: UserFactory
  ) {}
  findByEmail: (email: string) => Promise<User>;
  findByEmailAndPassword: (email: string, password: string) => Promise<User>;
  findBySignupVerifyToken: (signupVerifyToken: string) => Promise<User>;
  save: (item: Partial<User>) => Promise<User>;
  // save: (id: string, name: string, email: string, password: string, signupVerifyToken: string) => Promise<User>;
  async getByEmail(email: string): Promise<User> {
    return (
      await this.userRepository
      .createQueryBuilder('user')
      .select(`*`)
      .where('("user"."email" = :email)', { email: email })
      .limit(1)
      .getRawOne()
      ) as User;
  }

  async create(): Promise<User> {
    const user = new UserEntity()
    user.id
    user.email
    user.nickname
    user.password
    user.role
    user.type
    //save와 create는 분리해도 되는 로직. 
    return this.userFactory.reconstitute(user.id, user.email, user.nickname, user.password, user.role, user.type)
    // return await this.userRepository.save(this.userRepository.create(item));
  }

  //entity랑 도메인에 있는게 조금 다르다. 확장해서 써야 할까?
  async update(id: string, item: Partial<User>): Promise<any> {
    return await this.userRepository.update(id, item);
  }

  //null 반환을 명시적으로 써야 한다. 그런데 이거 어떻게 처리할 수 있는 방법 없나?
  async get(inputId: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id: inputId } });
    if (!userEntity) {
      return null;
    }
    const { id, nickname, email, password, role, type } = userEntity;

    return this.userFactory.reconstitute(id, nickname, email, password, role, type);
    // return await this.userRepository.findOne({ where: { id: id } });
  }
}
