import { UserEntity } from '../entity/user.entity';

export class SaveDto {
  private _id: string;

  private constructor(entity: UserEntity) {
    this._id = entity.id;
  }

  get id() {
    return this._id;
  }

  //entity??
  static from(entity: UserEntity) {
    const instance = new SaveDto(entity);
    return instance;
  }
}
