/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import Cookies from "universal-cookie";
import { SetData, GetData } from "../Utility/Function";
import SecurityService from "./SecurityService";

const CookieService = (function () {

  const _SecurityService = new SecurityService();

  const _Cookies = new Cookies();

  class CookieService {

    options(options: any): any {
      return Object.assign({
        path: '/',
        secure: true,
        sameSite: true
      }, options);
    }

    has(name: string, options = {}): boolean {
      options = this.options(options);
      return (_Cookies.get(name, options)) ? true : false;
    }

    getAll(options = {}): any[] {
      options = this.options(options);
      const cookies = _Cookies.getAll(options);
      for (let key of Object.keys(cookies)) {
        cookies[key] = GetData(_SecurityService.decrypt(cookies[key]));
      }
      return cookies;
    }

    get(name: any, options = {}): boolean | any {
      if (this.has(name, options)) {
        options = this.options(options);
        const value = _Cookies.get(name, options);
        return GetData(_SecurityService.decrypt(value));
      } else {
        return false;
      }
    }

    set(name: string, value: any, options = {}): boolean {
      options = this.options(options);
      value = _SecurityService.encrypt(SetData(value));
      _Cookies.set(name, value, options);
      return this.has(name, options);
    }

    delete(name: string, options = {}): boolean {
      options = this.options(options);
      _Cookies.remove(name, options);
      return (!this.has(name, options));
    }

    deleteAll(options = {}): boolean {
      options = this.options(options);
      const cookies = _Cookies.getAll(options);
      for (let key of Object.keys(cookies)) {
        this.delete(key, options);
      }
      return true;
    }

  }

  return CookieService;
})();

export const Cookie = new CookieService();

export default CookieService;
