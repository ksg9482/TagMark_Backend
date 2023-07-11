import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { User } from './user';
import { UserRole, UserType } from '../interface';
import { UserCreatedEvent } from './user-created.event';

@Injectable()
export class UserFactory {
  constructor(private eventBus: EventBus) {}

  create(
    id: string,
    email: string,
    nickname: string,
    password: string,
    signupVerifyToken: string,
    role: UserRole,
    type: UserType,
  ): User {
    const user = new User(
      id,
      email,
      nickname,
      password,
      signupVerifyToken,
      role,
      type,
    );
    this.eventBus.publish(new UserCreatedEvent(email, signupVerifyToken));
    return user;
  }

  reconstitute(
    id: string,
    email: string,
    nickname: string,
    password: string,
    signupVerifyToken: string,
    role: UserRole,
    type: UserType,
  ): User {
    return new User(
      id,
      email,
      nickname,
      password,
      signupVerifyToken,
      role,
      type,
    );
  }
}
