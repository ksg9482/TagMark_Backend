export class SaveUserResponseDto {
  private _id: string;

  constructor(id: string) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  //entity??
  static from(id: string) {
    const instance = new SaveUserResponseDto(id);
    return instance;
  }
}
