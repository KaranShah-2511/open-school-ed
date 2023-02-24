/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import QB from 'quickblox/quickblox.min';
import { Storage } from '../Core/Services/StorageService';

const QuickBloxService = (function () {

  let APPLICATION_ID = process.env.REACT_APP_QB_APPLICATION_ID || '';

  let AUTH_KEY = process.env.REACT_APP_QB_AUTH_KEY || '';

  let AUTH_SECRET = process.env.REACT_APP_QB_AUTH_SECRET || '';

  let ACCOUNT_KEY = process.env.REACT_APP_QB_ACCOUNT_KEY || '';

  let JANUS_URL = process.env.REACT_APP_QB_JANUS_URL || '';

  let _CONFIG = { debug: true };

  class QuickBloxService {

    private _QB: QB.QuickBlox;
    private _SESSION;

    constructor(APPLICATION_ID = null, AUTH_KEY = null, AUTH_SECRET = null, ACCOUNT_KEY = null, CONFIG = null) {
      this.setApplicationId(APPLICATION_ID);
      this.setAuthKey(AUTH_KEY);
      this.setAuthSecret(AUTH_SECRET);
      this.setAccountKey(ACCOUNT_KEY);
      this.setConfig(CONFIG);
    }

    setApplicationId(v: any) {
      APPLICATION_ID = (v) ? v : APPLICATION_ID;
    }

    getApplicationId(): any {
      return APPLICATION_ID;
    }

    setAuthKey(v: any) {
      AUTH_KEY = (v) ? v : AUTH_KEY;
    }

    getAuthKey(): any {
      return AUTH_KEY;
    }

    setAuthSecret(v: any) {
      AUTH_SECRET = (v) ? v : AUTH_SECRET;
    }

    getAuthSecret(): any {
      return AUTH_SECRET;
    }

    setAccountKey(v: any) {
      ACCOUNT_KEY = (v) ? v : ACCOUNT_KEY;
    }

    getAccountKey(): any {
      return ACCOUNT_KEY;
    }

    setJanusUrl(v: any) {
      JANUS_URL = (v) ? v : JANUS_URL;
    }

    getJanusUrl(): any {
      return JANUS_URL;
    }

    setConfig(v: any) {
      _CONFIG = (v) ? v : _CONFIG;
    }

    getConfig(): any {
      return _CONFIG;
    }

    init() {
      this._QB = new QB.QuickBlox();
      const args = [
        this.getApplicationId(),
        this.getAuthKey(),
        this.getAuthSecret(),
        this.getAccountKey(),
        this.getConfig()
      ];
      this._QB.init(...args);
    }

    get qbInstance() {
      return this._QB;
    }

    setSession(value: any) {
      this._SESSION = value;
    }

    get session() {
      return this._SESSION;
    }

    setup(callback?: ((e: any, r: any) => void)) {
      this.init();
      const qbSession: any = Storage.get('QB_APP_SESSION');
      const token = (qbSession) ? qbSession.token : this.getApplicationId();
      this.createSession(token, (e, r) => {
        if (!e) {
          Storage.set('QB_APP_SESSION', r);
          this.setSession(r);
        }
        else {
          Storage.delete('QB_APP_SESSION');
          // this.setup();
        }
        if (callback) { callback(e, r); }
      });
    }

    createSession(params, callback: ((e: any, r: any) => void)) {
      this._QB.createSession(params, callback);
    }

    destroySession(callback: ((e: any, r: any) => void)) {
      this._QB.destroySession((e, r) => {
        this.setSession(null);
        callback(e, r);
      });
    }

    login(params, callback: ((e: any, r: any) => void)) {
      this._QB.login(params, callback);
    }

    logout(callback: ((e: any, r: any) => void)) {
      this._QB.logout(callback);
    }

    getUser(qbID: number, callback: ((e: any, r: any) => void)) {
      this._QB.users.get(qbID, callback);
    }

    createUser(params: object, callback: ((e: any, r: any) => void)) {
      this._QB.users.create(params, callback)
    }

    updateUser(qbID: number, params: object, callback: ((e: any, r: any) => void)) {
      this._QB.users.update(qbID, params, callback)
    }

    createDialog(params: object, callback: ((e: any, r: any) => void)) {
      this._QB.chat.dialog.create(params, callback);
    }

    deleteDialog(dID: any[], callback: ((e: any, r: any) => void)) {
      this._QB.chat.dialog.delete(dID, callback);
    }

  }

  return QuickBloxService;
})();

export const QuickBlox = new QuickBloxService();

export default QuickBloxService;
