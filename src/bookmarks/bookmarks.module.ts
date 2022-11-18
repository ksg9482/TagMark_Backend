import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { TagsModule } from 'src/tags/tags.module';
import { Tag } from 'src/tags/entities/tag.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Bookmark]),TagsModule],
  providers: [BookmarksService],
  controllers: [BookmarksController]
})
export class BookmarksModule {}
