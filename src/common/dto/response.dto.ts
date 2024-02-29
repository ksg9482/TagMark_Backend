import { Expose } from 'class-transformer';

export class ResponseDto<T> {
  #ok: boolean;
  #data?: T;

  private constructor(ok: boolean, data?: T) {
    this.#ok = ok;
    this.#data = data;
  }

  @Expose()
  get ok() {
    return this.#ok;
  }

  @Expose()
  get data() {
    return this.#data;
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
