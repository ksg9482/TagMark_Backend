import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class UtilsService {
  /**
   * uuid를 가공하여 인덱스화 기능을 상승시킨 id를 반환한다.
   */
  getUuid(): string {
    const tokens = uuidV4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  }

  deepCopy(obj: any) {
    if (obj instanceof Array) {
      const result: any = [];
      const arr = obj.map((element) => this.deepCopy(element));
      result.push(...arr);
      return result;
    } else if (obj instanceof Object) {
      const result = new obj.constructor();
      Object.keys(obj).forEach((k) => {
        result[k] = this.deepCopy(obj[k]);
      });
      return result;
    } else return obj;
  }
}
