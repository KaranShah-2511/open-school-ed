/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import Cache from './CacheService';
import { Http } from './HttpService';

/**
 * Api Remove Cache In Store
 * @param key string.
 * @param group string.
 * @returns func() Promise\<T>
 */

export function modelcacheremove(key?: string, group?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    return {
      value: function (...args) {
        let _key = key;
        if (_key && args.length) {
          for (let i = 0; i < args.length; i++) {
            let val = (args[i] instanceof Array || args[i] instanceof Object) ? JSON.stringify(args[i]) : args[i];
            val = val.replaceAll('.', '-');
            _key = _key.replaceAll('{' + i + '}', val);
          }
        }
        const next = () => {
          const call = descriptor.value.apply(this, args);
          return call.then((res) => {
            return res;
          });
        };
        if (_key) {
          return Cache.remove(_key, group).then(() => next());
        } else if (group) {
          return Cache.removeAll(group).then(() => next());
        } else {
          return next();
        }
      }
    };
  }
}

/**
 * Api Response Store In Cache
 * @param key string.
 * @param group string.
 * @returns func() Promise\<T>
 */
export function modelcache(key: string, group?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    return {
      value: function (...args) {
        let _key = key;
        if (args.length) {
          for (let i = 0; i < args.length; i++) {
            let val = (args[i] instanceof Array || args[i] instanceof Object) ? JSON.stringify(args[i]) : args[i];
            val = val.replaceAll('.', '-');
            _key = _key.replaceAll('{' + i + '}', val);
          }
        }
        const next = () => {
          const call = descriptor.value.apply(this, args);
          return call.then((res) => {
            Cache.set(_key, res, group);
            return res;
          });
        };
        return Cache.get(_key, group)
          .then((res) => {
            if (res) {
              return res;
            } else {
              return next();
            }
          });
      }
    };
  }
}

/**
 * Model Error Entity
 * @export
 * @class MyModelError
 */
export class MyModelError {
  type: 'client' | 'server';
  message: any;

  constructor(type: 'client' | 'server', error: any) {
    Object.assign(this, error);
    this.type = type;
  }
}

/**
 * Model Entity
 * @export
 * @class MyModelEntity
 */
export class MyModelEntity {

  id: string | number;

  constructor(data?: Partial<any>) {
    if (data) {
      this.id = data._id || 0;
      // this.objectAssign(this, data);
    }
  }

  protected objectAssign<T extends Object>(obj: T, data: object) {
    const properties = Object.keys(data);
    properties.forEach((property) => {
      const desc =
        Object.getOwnPropertyDescriptor(obj, property)
        || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), property)
        || {};
      if (desc.writable && data[property] !== undefined) {
        obj[property] = data[property];
      }
    });
  }

}

/**
 * Pagination Entity
 * @export
 * @class Pagination
 * @extends {MyModelEntity}
 */
export class Pagination extends MyModelEntity {

  private Limit: number;
  private Page: number;
  private TotalCount: number;
  private _Limit: number;
  private _CurrentPage: number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get totalCount(): number {
    return this.TotalCount;
  }

  get page(): number {
    return this.Page;
  }

  get limit(): number {
    return (this._Limit) ? this._Limit : this.Limit;
  }

  setLimit(limit: number) {
    this._Limit = (limit) ? limit : this.limit;
  }

  get currentPage(): number {
    return (this._CurrentPage) ? this._CurrentPage : this.page;
  }

  setPage(page: number) {
    this._CurrentPage = (page) ? page : this.currentPage;
  }

  get prevPage(): number | boolean {
    if (!this.currentPage) return false;
    if (this.currentPage <= 1) return false;
    return this.currentPage - 1;
  }

  get nextPage(): number | boolean {
    if (!this.totalCount) return false;

    const limit = this.limit * this.currentPage;
    if (this.totalCount > limit) {
      return this.currentPage + 1;
    } else {
      return false;
    }
  }

}

/**
 * Model Service
 * @export
 * @class MyModelService
 * @template T
 */
export class MyModelService<T> {

  private endpoint: string;

  get url(): string {
    return this.endpoint;
  }

  setUrl(endpoint: string) {
    this.endpoint = endpoint;
  }

  find<TFind>(id: TFind, option?: any): Promise<T> {
    return Http.get(this.url + '/' + id, option);
  };

}