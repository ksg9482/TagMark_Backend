import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkFactory } from './domain/bookmark.factory';
import { BookmarkEntity } from './infra/db/entity/bookmark.entity';
import { BookmarkController } from './interface/bookmark.controller';
import { BookmarkRepository } from './infra/db/repository/bookmark.repository';
import { BookmarkUseCases } from './application/bookmark.use-case';
import { TagRepository } from 'src/tag/infra/db/repository/tag.repository';
import { TagFactory } from 'src/tag/domain/tag.factory';
import { TagModule } from 'src/tag/tag.module';
import { TagEntity } from 'src/tag/infra/db/entity/tag.entity';



const factories = [
  BookmarkFactory,
  //TagFactory,
];

const useCases = [
  BookmarkUseCases
]

const repositories = [
  { provide: 'BookmarkRepository', useClass: BookmarkRepository },
  { provide: 'TagRepository', useClass: TagRepository },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkEntity, TagEntity]),
    TagModule,
  ],
  controllers: [BookmarkController],
  providers: [
    Logger,
    ...factories,
    ...useCases,
    ...repositories,
  ],
  exports:[...useCases, ...factories]

})
export class BookmarkModule { }
