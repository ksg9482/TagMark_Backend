import { Exclude, Expose } from 'class-transformer';

export class ResponseDto<T> {
  @Exclude() private _ok: boolean;
  @Exclude() private _data?: T;

  private constructor(ok: boolean, data?: T) {
    this._ok = ok;
    this._data = data;
  }

  @Expose()
  get ok() {
    return this._ok;
  }

  @Expose()
  get data() {
    return this._data;
  }

  static OK() {
    return new ResponseDto(true);
  }
  static OK_WITH<T>(data: T) {
    return new ResponseDto<T>(true, data);
  }

  static ERROR_WITH<T>(error: T) {
    return new ResponseDto<T>(false, error);
  }
}
