import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { DataSource } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../users/entities/user.entity';

export class CreateInitialUserData implements Seeder {
  public async run(factory: Factory, dataSource: DataSource): Promise<any> {
    const now = new Date().toISOString()
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        { id: 1, nickname: '깨꺠오', email:'s', password:'1', createdAt:new Date(), updatedAt:new Date()}
      ])
      .execute();

      await dataSource
      .createQueryBuilder()
      .insert()
      .into(Bookmark)
      .values([
        { id: 1, createdAt:new Date(), updatedAt:new Date()}
      ])
      .execute();
  }
 
}