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
import { ConfigModule } from '@nestjs/config';
import { validate } from './utils/validate/env.validation';
import { Bookmarks_Tags } from './tags/entities/bookmarks_tags.entity';
import { Users_Tags } from './tags/entities/users_tags.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validate
    }),
    AuthModule, 
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
      refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'production', 
      logging: process.env.NODE_ENV !== 'production',
      //useUTC:true,
      entities: [
        User, 
        Bookmark,
        Tag,
        Users_Tags,
        Bookmarks_Tags
      ]
    }),
    UsersModule, 
    BookmarksModule, 
    TagsModule, 
    UtilsModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
