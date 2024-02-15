import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import Configuration from 'src/config/configuration';
import { User } from 'src/user/domain';

@Injectable()
export class SecureService {
  constructor(
    @Inject(Configuration.KEY) private config: ConfigType<typeof Configuration>,
  ) {}
  async checkPassword(password: string, user: User): Promise<boolean> {
    console.log(password);
    console.log(user.password);
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      return false;
    }
  }

  secure() {
    const SECRET_KEY = this.config.cryptoSecretKey;
    const encrypt = (message: string) => {
      const encrypted = CryptoJS.AES.encrypt(message, SECRET_KEY);
      return encrypted.toString();
    };

    const decrypt = (data: string) => {
      const decrypted = CryptoJS.AES.decrypt(data, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    };

    const encryptWrapper = (data: any) => {
      return encrypt(data);
    };

    const decryptWrapper = (encryptStr: string) => {
      try {
        const result = decrypt(encryptStr);
        if (!result) {
          throw false;
        }
        return result;
      } catch (error) {
        return encryptStr;
      }
    };

    const wrapper = () => {
      return {
        encryptWrapper,
        decryptWrapper,
      };
    };

    return {
      wrapper,
    };
  }
}
