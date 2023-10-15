import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkFactory } from './domain/bookmark.factory';
import { BookmarkEntity } from './infra/db/entity/bookmark.entity';
import { BookmarkController } from './interface/bookmark.controller';
import { BookmarkRepository } from './infra/db/repository/bookmark.repository';
import { BookmarkUseCases } from './application/bookmark.use-case';
import { TagModule } from 'src/tag/tag.module';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';

const factories = [BookmarkFactory];

const useCases = [BookmarkUseCases];

const repositories = [
  { provide: 'BookmarkRepository', useClass: BookmarkRepository },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkEntity, TagEntity]),
    TagModule,
    UtilsModule,
    AuthModule,
  ],
  controllers: [BookmarkController],
  providers: [Logger, ...factories, ...useCases, ...repositories],
  exports: [...useCases, ...factories],
})
export class BookmarkModule {}
