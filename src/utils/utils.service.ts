import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  deepCopy(obj: any) {
    if (obj instanceof Object) {
      const result = new obj.constructor();
      Object.keys(obj).forEach((k) => {
        result[k] = this.deepCopy(obj[k]);
      });
      return result;
    } else if (obj instanceof Array) {
      obj.map((element) => this.deepCopy(element));
    } else return obj;
  }
}
