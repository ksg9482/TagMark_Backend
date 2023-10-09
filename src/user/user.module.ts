import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UserFactory } from './domain/user.factory';
import { UserEntity } from './infra/db/entity/user.entity';
import { UserController } from './interface/user.controller';
import { UserRepository } from './infra/db/repository/user.repository';
import { UserUseCases } from './application/user.use-case';
import { UtilsModule } from 'src/utils/utils.module';

const factories = [UserFactory];

const useCases = [UserUseCases];

const repositories = [{ provide: 'UserRepository', useClass: UserRepository }];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    UtilsModule,
    HttpModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [Logger, ...factories, ...useCases, ...repositories],
  exports: [...useCases],
})
export class UsersModule {}
