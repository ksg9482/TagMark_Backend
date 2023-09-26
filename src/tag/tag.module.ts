import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagFactory } from './domain/tag.factory';
import { TagEntity } from './infra/db/entity/tag.entity';
import { TagController } from './interface/tag.controller';
import { TagRepository } from './infra/db/repository/tag.repository';
import { TagUseCases } from './application/tag.use-case';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';

const factories = [TagFactory];

const useCases = [TagUseCases];

const repositories = [
  { provide: 'TagRepository', useClass: TagRepository }
];

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity]), UtilsModule, AuthModule],
  controllers: [TagController],
  providers: [Logger, ...factories, ...useCases, ...repositories],
  exports: [...useCases, ...factories, ...repositories],
})
export class TagModule {}
