import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'domain';
import { DataServices } from 'src/core/abstracts';
import { Bookmark, Bookmarks_Tags, Tag, User} from './model';
import { PostgresqlDataServices } from './postgresql-data-services.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') !== 'production',
        entities:[__dirname + './../../**/*.model{.ts,.js}'],
      })
    }),
    TypeOrmModule.forFeature([
      User,
      Tag,
      Domain,
      Bookmark,
      Bookmarks_Tags
    ])
  ],
  providers: [
    {
      provide: DataServices, //추상클래스
      useClass: PostgresqlDataServices //사용할 구현체
    }
  ],
  exports: [DataServices]
})

export class PostgresqlDataServicesModule { }
