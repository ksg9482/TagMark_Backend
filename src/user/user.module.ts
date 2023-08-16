import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserFactory } from './domain/user.factory';
import { UserEntity } from './infra/db/entity/user.entity';
import { UserController } from './interface/user.controller';
import { UserRepository } from './infra/db/repository/user.repository';
import { UserUseCases } from './application/user.use-case';



const factories = [
  UserFactory,
];

const useCases = [
  UserUseCases
]

const repositories = [
  { provide: 'UserRepository', useClass: UserRepository },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule, //auth에서 쓰는게 아니라 auth를 user에서 쓴다 -> 소스원천 통일
  ],
  controllers: [UserController],
  providers: [
    Logger,
    ...factories,
    ...useCases,
    ...repositories,
  ],
})
export class UsersModule { }
