import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagFactory } from './domain/tag.factory';
import { TagEntity } from './infra/db/entity/tag.entity';
import { TagController } from './interface/tag.controller';
import { TagRepository } from './infra/db/repository/tag.repository';
import { TagUseCases, TagUseCasesImpl } from './application/tag.use-case';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity]), UtilsModule, AuthModule],
  controllers: [TagController],
  providers: [
    { provide: TagUseCases, useClass: TagUseCasesImpl },
    { provide: 'TagRepository', useClass: TagRepository },
    TagFactory,
    Logger,
  ],
  exports: [
    { provide: TagUseCases, useClass: TagUseCasesImpl },
    { provide: 'TagRepository', useClass: TagRepository },
    TagFactory,
  ],
})
export class TagModule {}
