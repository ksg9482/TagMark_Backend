import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import * as dotenv from 'dotenv';
// import { User } from './src/users/entities/user.entity';

dotenv.config();
// const config: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   entities: [User,Domain,Bookmark,SimilarTag,Tag,Bookmarks_Tags],
//   synchronize: false, 
//   migrations: [__dirname + '/src/database/seeds/*ts'],
//   autoLoadEntities: true,
//   logging: true, 
//   keepConnectionAlive: true
// };
const config: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [/*User*/],
    synchronize: false, 
    migrations: [__dirname + '/src/database/seeds/*ts'],
    //cli: { migrationsDir: 'src/migrations' },
    autoLoadEntities: true,
    charset: 'utf8mb4',
    logging: true, 
    keepConnectionAlive: true,
  };

export = config;