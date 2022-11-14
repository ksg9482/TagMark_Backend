import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from './jwt/jwt.module';
import { User } from './users/entities/user.entity';
import { Bookmark } from './bookmarks/entities/bookmark.entity';
import { Tag } from './tags/entities/tag.entity';
import { Domain } from './bookmarks/entities/domain.entity';
import { ConfigModule } from '@nestjs/config';
import { validate } from './utils/validate/env.validation';
import { Bookmarks_Tags } from './tags/entities/bookmarks_tags.entity';
import { Users_Tags } from './tags/entities/users_tags.entity';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserUsecasesModule } from './use-cases/user';
import { BookmarkUsecasesModule } from './use-cases/bookmark';
import { TagUsecasesModule } from './use-cases/tag';
import { BookmarkController, TagController, UserController } from './controllers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validate
    }),
    DataServicesModule,
    UserUsecasesModule,
    BookmarkUsecasesModule,
    TagUsecasesModule,
    //AuthModule, 
    // JwtModule.forRoot({
    //   privateKey: process.env.PRIVATE_KEY,
    //   refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY
    // })
    UtilsModule, 
    //UsersModule, 
    //BookmarksModule, 
    //TagsModule, 
  ],
  controllers: [
    UserController,
    BookmarkController,
    TagController
  ],
  providers: [],
})
export class AppModule {}
