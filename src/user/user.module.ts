import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UserFactory } from './domain/user.factory';
import { UserEntity } from './infra/db/entity/user.entity';
import { UserController } from './interface/user.controller';
import { UserRepositoryImpl } from './infra/db/repository/user.repository';
import { UserUseCases } from './application/user.use-case';
import { UtilsModule } from 'src/utils/utils.module';
import { UserRepository } from './domain/repository/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    UtilsModule,
    HttpModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [
    UserUseCases,
    { provide: UserRepository, useClass: UserRepositoryImpl },
    Logger,
    UserFactory,
  ],
  exports: [UserUseCases],
})
export class UsersModule {}
