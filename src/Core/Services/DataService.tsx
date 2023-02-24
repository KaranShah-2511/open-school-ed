/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { cloneDeep } from "lodash";

export class DataService {

  private store$: any;

  private getStoreData(dataObj?: object) {
    return (
      (dataObj !== undefined)
        ? dataObj
        : ((this.store$ !== undefined) ? cloneDeep(this.store$) : undefined)
    );
  }

  private _set(data: any, keyObj: any, value?: any, type: string = 'set'): Promise<any> {
    return new Promise((resolve, reject) => {
      const keyLength = keyObj.length;
      const newKey = keyObj;
      if (keyObj.length === 0) {
        reject();
      }
      for (let index = 0; index < keyObj.length; index++) {
        const key = keyObj[index];
        newKey.splice(index, 1);
        if (data !== undefined && data.hasOwnProperty(key)) {
          if (keyLength === (index + 1)) {
            if (data[key] !== undefined && type === 'insert') {
              if (data[key] instanceof Array) {
                data[key].push(value);
              } else if (data[key] instanceof Object) {
                data[key] = Object.assign(data[key], value);
              } else {
                data[key] = value;
              }
            } else {
              data[key] = value;
            }
            resolve({ 'store': data, 'value': data[key] });
          } else {
            this._set(data[key], newKey, value, type)
              .then((res) => {
                data[key] = res.store;
                resolve({ 'store': data, 'value': res.value });
              });
          }
        } else {
          if (keyLength === (index + 1)) {
            if (data[key] !== undefined && type === 'insert') {
              if (data[key] instanceof Array) {
                data[key].push(value);
              } else {
                data[key] = Object.assign(data[key], value);
              }
            } else {
              data[key] = value;
            }
            resolve({ 'store': data, 'value': data[key] });
          } else {
            this._set({}, newKey, value, type)
              .then((res) => {
                data[key] = res.store;
                resolve({ 'store': data, 'value': res.value });
              });
          }
        }
      }
    });
  }

  async set(key: string, value: any, dataObj?: object): Promise<any> {
    const keyObj = key.split('.');
    let data = this.getStoreData(dataObj);
    if (data === undefined) {
      data = {};
      if (dataObj === undefined) {
        this.store$ = {};
      }
    }
    return await this._set(data, keyObj, value)
      .then((res) => {
        if (dataObj === undefined) {
          this.store$ = res.store;
          return res.value;
        } else {
          return res.store;
        }
      });
  }

  async insert(key: string, value: any, dataObj?: object): Promise<any> {
    const keyObj = key.split('.');
    let data = this.getStoreData(dataObj);
    if (data === undefined) {
      data = {};
      if (dataObj === undefined) {
        this.store$ = {};
      }
    }
    return await this._set(data, keyObj, value, 'insert')
      .then((res) => {
        if (dataObj === undefined) {
          this.store$ = res.store;
          return res.value;
        } else {
          return res.store;
        }
      });
  }

  async getAll(): Promise<any> {
    return await new Promise((resolve, reject) => { resolve(this.getStoreData()); });
  }

  private _get(data: any, keyObj: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const keyLength = keyObj.length;
      const newKey = keyObj;
      if (keyObj.length === 0) {
        reject();
      }
      for (let index = 0; index < keyObj.length; index++) {
        const key = keyObj[index];
        newKey.splice(index, 1);
        if (data !== undefined && data.hasOwnProperty(key)) {
          if (keyLength === (index + 1)) {
            resolve(data[key]);
          } else {
            this._get(data[key], newKey, value)
              .then((res) => {
                resolve(res);
              });
          }
        } else {
          resolve(value);
          // if (keyLength === (index + 1)) {
          //   resolve(value);
          // } else {
          //   this._get({}, newKey, value)
          //     .then((res) => {
          //       resolve(res);
          //     });
          // }
        }
      }
    });
  }

  async get(key: string, value?: any, dataObj?: object): Promise<any> {
    const keyObj = key.split('.');
    const data = this.getStoreData(dataObj);
    if (data !== undefined) {
      return await this._get(data, keyObj, value).then((res) => res);
    } else {
      return await new Promise((resolve, reject) => { resolve(value); });
    }
  }

  private _check(data: any, keyObj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const keyLength = keyObj.length;
      const newKey = keyObj;
      if (keyObj.length === 0) {
        reject();
      }
      for (let index = 0; index < keyObj.length; index++) {
        const key = keyObj[index];
        newKey.splice(index, 1);
        if (data !== undefined && data.hasOwnProperty(key)) {
          if (keyLength === (index + 1)) {
            resolve(true);
          } else {
            this._check(data[key], newKey)
              .then((res) => {
                resolve(res);
              });
          }
        } else {
          resolve(false);
        }
      }
    });
  }

  async check(key: string, dataObj?: object): Promise<any> {
    const keyObj = key.split('.');
    const data = this.getStoreData(dataObj);
    if (data !== undefined) {
      return await this._check(data, keyObj);
    } else {
      return await new Promise((resolve, reject) => { resolve(false); });
    }
  }

  private _delete(data: any, keyObj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const keyLength = keyObj.length;
      const newKey = keyObj;
      if (keyObj.length === 0) {
        reject();
      }
      for (let index = 0; index < keyObj.length; index++) {
        const key = keyObj[index];
        newKey.splice(index, 1);
        if (data !== undefined && data.hasOwnProperty(key)) {
          if (keyLength === (index + 1)) {
            const deleteValue = data[key];
            if (data instanceof Array) {
              data.splice(key, 1);
              if (data.length === 0) {
                data = undefined;
              }
            } else {
              delete data[key];
            }
            resolve({ 'store': data, 'value': deleteValue });
          } else {
            this._delete(data[key], newKey)
              // eslint-disable-next-line no-loop-func
              .then((res) => {
                data[key] = res.store;
                resolve({ 'store': data, 'value': res.value });
              })
              .catch(() => { });
          }
        } else {
          resolve({ 'store': data, 'value': null });
        }
      }
    });
  }

  async delete(key: string, dataObj?: object): Promise<any> {
    const keyObj = key.split('.');
    const data = this.getStoreData(dataObj);
    if (data !== undefined) {
      return await this._delete(data, keyObj).then((res) => {
        if (dataObj === undefined) {
          this.store$ = res.store;
          return res.value;
        } else {
          return res.store;
        }
      });
    } else {
      return await new Promise((resolve, reject) => { resolve(false); });
    }
  }

  clear() {
    this.store$ = undefined;
    return true;
  }

}

export const DataStore = new DataService();

export default DataService;