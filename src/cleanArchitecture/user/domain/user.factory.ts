import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { User } from './user';
import { UserRole, UserType } from 'src/cleanArchitecture/user/domain';
import { UserCreatedEvent } from './user-created.event';

//팩토리는 도메인 객체의 생성을 담당. reconstitute은 엔티티 객체를 도메인 객체로 변환하여 재구성
@Injectable()
export class UserFactory {
  constructor(private eventBus: EventBus) {}

  create(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): User {
    const user = new User(id, email, nickname, password, role, type);
    this.eventBus.publish(new UserCreatedEvent(email));
    return user;
  }

  reconstitute(
    id: string,
    email: string,
    nickname: string,
    password: string,
    role: UserRole,
    type: UserType,
  ): User {
    return new User(id, email, nickname, password, role, type);
  }
}
