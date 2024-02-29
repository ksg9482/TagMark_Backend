import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkFactory } from './domain/bookmark.factory';
import { BookmarkEntity } from './infra/db/entity/bookmark.entity';
import { BookmarkController } from './interface/bookmark.controller';
import { BookmarkRepositoryImpl } from './infra/db/repository/bookmark.repository';
import {
  BookmarkUseCase,
  BookmarkUseCaseImpl,
} from './application/bookmark.use-case';
import { TagModule } from 'src/tag/tag.module';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkEntity, TagEntity]),
    TagModule,
    UtilsModule,
    AuthModule,
  ],
  controllers: [BookmarkController],
  providers: [
    { provide: BookmarkUseCase, useClass: BookmarkUseCaseImpl },
    { provide: 'BookmarkRepository', useClass: BookmarkRepositoryImpl },
    BookmarkFactory,
    Logger,
  ],
  exports: [
    { provide: BookmarkUseCase, useClass: BookmarkUseCaseImpl },
    BookmarkFactory,
  ],
})
export class BookmarkModule {}
