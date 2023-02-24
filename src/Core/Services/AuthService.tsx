/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { User } from "../../Services/UserService";
import CookieService from "./CookieService";
import StorageService from "./StorageService";

const AuthService = (function () {

  let _STORAGE_KEY = (
    (process.env.REACT_APP_AUTH_STORAGE_KEY)
      ? process.env.REACT_APP_AUTH_STORAGE_KEY
      : 'AUTH.USER'
  );

  let _STORAGE_TYPE = (
    (process.env.REACT_APP_AUTH_STORAGE_TYPE && ['cookie', 'local', 'session'].includes(process.env.REACT_APP_AUTH_STORAGE_TYPE))
      ? process.env.REACT_APP_AUTH_STORAGE_TYPE
      : 'cookie'
  );

  let _DURATION: number = Number(process.env.REACT_APP_AUTH_DURATION) || 30;

  const Storage = (): any => {
    return (_STORAGE_TYPE === 'cookie') ? new CookieService() : new StorageService(_STORAGE_TYPE);
  }

  const diff = (endTime: number, startTime?: Date) => {
    const sTime = (startTime) ? startTime.getTime() : (new Date().getTime());
    return endTime - sTime;
  }

  class AuthService {

    constructor(type = null, duration = null) {
      _STORAGE_TYPE = (type !== null && ['cookie', 'local', 'session'].includes(type)) ? type : _STORAGE_TYPE;
      _DURATION = (duration !== null) ? duration : _DURATION;
    }

    get() {
      return Storage().get(_STORAGE_KEY);
    }

    getUser(): User {
      const auth = this.get();
      if (auth && auth != null) {
        if (diff(auth.expires) > 0) {
          return new User(auth.user);
        } else {
          Storage().delete(_STORAGE_KEY);
          return new User();
        }
      } else {
        Storage().delete(_STORAGE_KEY);
        return new User();
      }
    }

    isAuthorized(): boolean {
      return (this.getUser().id) ? true : false;
    }

    setUser(data: any): Promise<User | boolean> {
      return new Promise((resolve, reject) => {
        const expires: number = new Date(new Date().getTime() + (_DURATION * 60000)).getTime();
        const auth = {
          user: data,
          expires: expires
        };
        if (_STORAGE_TYPE === 'cookie') {
          Storage().set(_STORAGE_KEY, auth, {
            expires: new Date(expires)
          });
        } else {
          Storage().set(_STORAGE_KEY, auth);
        }
        const user = this.getUser();
        if (user.id) {
          resolve(user);
        } else {
          reject(false);
        }
      });
    }

    logout(): Promise<boolean> {
      return new Promise((resolve) => {
        const logout = Storage().delete(_STORAGE_KEY);
        resolve(logout);
      });
    }

  }

  return AuthService;
})();

export const Auth = new AuthService();

export default AuthService;
