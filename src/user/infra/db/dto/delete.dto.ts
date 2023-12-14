import { UserEntity } from '../entity/user.entity';

export class DeleteDto {
  private _id: string;

  private constructor(entity: UserEntity) {
    this._id = entity.id;
  }

  get id() {
    return this._id;
  }

  static from(entity: UserEntity) {
    const dto = new DeleteDto(entity);
    return dto;
  }
}
