import { Test } from '@nestjs/testing';
import { v4 as uuidV4 } from 'uuid';

import { UtilsService } from './utils.service';

describe('utilsService', () => {
  let utilsService: UtilsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UtilsService,
        UtilsService,
        {
          provide: `CONFIGURATION(config)`,
          useValue: {},
        },
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {
            privateKey: 'mockPrivateKey',
          },
        },
      ],
    }).compile();
    utilsService = module.get(UtilsService);
  });

  describe('define', () => {
    it('be defined utilsService', () => {
      expect(utilsService).toBeDefined();
    });
  });

  describe('getUuid', () => {
    const mockUuid = '28ef9771-1560-4a0d-bfa7-8298e3fe616b';
    const mockChangedUuid = '4a0d156028ef9771bfa78298e3fe616b';
    it('uuid로 이루어진 문자열을 반환한다.', () => {
      expect(utilsService.getUuid().length).toBe(mockChangedUuid.length);
    });
  });

  describe('deepCopy', () => {
    it('객체를 인수로 제공하면 복사하여 반환한다.', () => {
      const testObj = {
        strKey: 'value',
        numKey: 0,
        objKey: {
          strKey: 'value1',
          numKey: 1,
        },
      };
      expect(utilsService.deepCopy(testObj)).toStrictEqual(testObj);
    });

    it('배열을 인수로 제공하면 복사하여 반환한다.', () => {
      const testArr = ['value0', 0, ['value1', 1]];
      expect(utilsService.deepCopy(testArr)).toStrictEqual(testArr);
    });

    it('배열과 객체가 섞인 데이터를 인수로 제공하면 복사하여 반환한다.', () => {
      const testObjWithArr = [
        {
          strKey: 'value',
          numKey: 0,
          objKey: {
            strKey: 'value1',
            numKey: 1,
            arrKey: ['value0', 0, ['value1', 1]],
          },
        },
      ];
      expect(utilsService.deepCopy(testObjWithArr)).toStrictEqual(
        testObjWithArr,
      );
    });
  });
});