import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { SimilarTag } from './entities/similarTag.entity';
import { Bookmarks_Tags } from './entities/bookmarks_tags.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Tag, SimilarTag, Bookmarks_Tags])],
  providers: [TagsService],
  controllers: [TagsController]
})
export class TagsModule {}
