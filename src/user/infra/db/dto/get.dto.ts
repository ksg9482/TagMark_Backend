import { UserEntity } from '../entity/user.entity';

export class GetDto {
  private _id: string;
  private _email: string;
  private _nickname: string;
  private _password: string;
  private _role: string;
  private _type: string;

  private constructor(entity: UserEntity) {
    this._id = entity.id;
    this._email = entity.email;
    this._nickname = entity.nickname;
    this._password = entity.password;
    this._role = entity.role;
    this._type = entity.type;
  }

  get id() {
    return this._id;
  }
  get email() {
    return this._email;
  }
  get nickname() {
    return this._nickname;
  }
  get password() {
    return this._password;
  }
  get role() {
    return this._role;
  }
  get type() {
    return this._type;
  }

  static from(entity: UserEntity) {
    const dto = new GetDto(entity);
    return dto;
  }
}
