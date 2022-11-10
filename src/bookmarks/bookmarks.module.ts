import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Domain } from './entities/domain.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Bookmark, Domain])],
  providers: [BookmarksService],
  controllers: [BookmarksController]
})
export class BookmarksModule {}
