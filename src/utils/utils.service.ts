import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class UtilsService {
  /**
   * uuid를 가공하여 인덱스화 기능을 상승시킨 id를 반환한다.
   * 숫자 id에서 문자id로 변경
아이디가 노출되어 다른 유저의 아이디를 유추할 수 없도록
아이디의 정렬등 약점이 있지만 uuid의 표현 방식을 수정하여 약점을 보완하려고 시도.
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
