import { Global, Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Bookmarks_Tags } from './entities/bookmarks_tags.entity';
import { Users_Tags } from './entities/users_tags.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Tag, Bookmarks_Tags, Users_Tags])],
  providers: [TagsService],
  controllers: [TagsController],
  exports:[TagsService]
})
export class TagsModule {}
