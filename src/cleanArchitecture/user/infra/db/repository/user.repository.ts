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
  save: (id: string, name: string, email: string, password: string, signupVerifyToken: string) => Promise<void>;
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

  async update(id: string, email: string, nickname:string): Promise<any> {
    return await this.userRepository.update(id, {id, email, nickname});
  }

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
