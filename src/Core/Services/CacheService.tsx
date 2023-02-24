/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import DataService, { DataStore } from "./DataService";


const CacheService = (function () {

  const storage: DataService = DataStore

  let _CACHE_KEY = '@ZK-Cache@';

  let _DEFAULT_GROUP_KEY = process.env.REACT_APP_CACHE_GROUP_KEY || '@ZK-GP-Cache@';

  class CacheService {

    constructor(groupKey?: string) {
      _DEFAULT_GROUP_KEY = (groupKey) ? 'GP-' + groupKey : _DEFAULT_GROUP_KEY;
    }

    get cacheKey(): string {
      return _CACHE_KEY;
    }

    get groupKey(): string {
      return _DEFAULT_GROUP_KEY;
    }

    private setGroupKey(groupKey?: string): string {
      return (groupKey) ? 'GP-' + groupKey : this.groupKey;
    }

    private generateKey(...args: any[]): string {
      return [this.cacheKey, ...args].join('.');
    }

    set(key: string, value: any, groupKey?: string): Promise<any> {
      const nGpKey = this.setGroupKey(groupKey);
      const sKey = this.generateKey(nGpKey, key);
      return storage.set(sKey, value);
    }

    get(key: string, groupKey?: string): Promise<any> {
      const nGpKey = this.setGroupKey(groupKey);
      const gKey = this.generateKey(nGpKey, key);
      return storage.get(gKey);
    }

    remove(key: string, groupKey?: string) {
      const nGpKey = this.setGroupKey(groupKey);
      const rKey = this.generateKey(nGpKey, key);
      return storage.delete(rKey);
    }

    removeAll(groupKey?: string) {
      const args = (groupKey) ? [this.setGroupKey(groupKey)] : [];
      const rKey = this.generateKey(...args);
      return storage.delete(rKey);
    }
  }
  return CacheService;
})();

const Cache = new CacheService();

export default Cache;
