import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagFactory } from './domain/tag.factory';
import { TagEntity } from './infra/db/entity/tag.entity';
import { TagController } from './interface/tag.controller';
import { TagRepositoryImpl } from './infra/db/repository/tag.repository';
import { TagUseCase, TagUseCaseImpl } from './application/tag.use-case';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity]), UtilsModule, AuthModule],
  controllers: [TagController],
  providers: [
    { provide: TagUseCase, useClass: TagUseCaseImpl },
    { provide: 'TagRepository', useClass: TagRepositoryImpl },
    TagFactory,
    Logger,
  ],
  exports: [
    { provide: TagUseCase, useClass: TagUseCaseImpl },
    { provide: 'TagRepository', useClass: TagRepositoryImpl },
    TagFactory,
  ],
})
export class TagModule {}
