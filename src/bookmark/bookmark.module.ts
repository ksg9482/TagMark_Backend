import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkFactory } from './domain/bookmark.factory';
import { BookmarkEntity } from './infra/db/entity/bookmark.entity';
import { BookmarkController } from './interface/bookmark.controller';
import { BookmarkRepository } from './infra/db/repository/bookmark.repository';
import { BookmarkUseCases } from './application/bookmark.use-case';



const factories = [
  BookmarkFactory,
];

const useCases = [
  BookmarkUseCases
]

const repositories = [
  { provide: 'BookmarkRepository', useClass: BookmarkRepository },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkEntity]),
  ],
  controllers: [BookmarkController],
  providers: [
    Logger,
    ...factories,
    ...useCases,
    ...repositories,
  ],
})
export class BookmarkModule { }
