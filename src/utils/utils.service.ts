import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt"
import * as CryptoJS from 'crypto-js';
import { User } from "src/core";

@Injectable()
export class UtilsService {
    async checkPassword(password: string, user: User): Promise<boolean> {
        try {
            return await bcrypt.compare(password, user.password)
        } catch (error) {
            return false
        }
    }

    secure() {
        const SECRET_KEY = process.env.CRYPTOJS_SECRET_KEY;
        const encrypt = (message: string) => {
            const encrypted = CryptoJS.AES.encrypt(message, SECRET_KEY)
            return encrypted.toString()
        }
        const decrypt = (data: string) => {
            const decrypted = CryptoJS.AES.decrypt(data, SECRET_KEY)
            return decrypted.toString(CryptoJS.enc.Utf8)
        }
        const setItem = (key: string, item: string) => {
            localStorage.setItem(key, encrypt(item))
        }
        const getItem = (key: string) => {
            const encrypted = localStorage.getItem(key)
            if (!encrypted) {
                return null
            }
            else {
                return decrypt(encrypted)
            }

        }
        const removeItem = (key: string) => {
            localStorage.removeItem(key)
        }
        const local = () => {
            return {
                setItem, getItem, removeItem
            }
        }
        const encryptWrapper = (data: any) => {
            return encrypt(data)
        }
        const decryptWrapper = (encryptStr: string) => {
            try {
                const result = decrypt(encryptStr)
                if (!result) { throw false }
                return result
            } catch (error) {
                return encryptStr;
            }
        }

        const wrapper = () => {
            return {
                encryptWrapper, decryptWrapper
            }
        }

        return {
            local, wrapper
        }
    }

    deepCopy(obj: any) {
        if (obj instanceof Object) {
            let result = new obj.constructor();
            Object.keys(obj).forEach(k => {
                result[k] = this.deepCopy(obj[k]);
            })
            return result;
        }
        else if (obj instanceof Array) {
            let result = obj.map(element => this.deepCopy(element));
        }
        else return obj;
    }
}