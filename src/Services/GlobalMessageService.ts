/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { Http } from '../Core/Services/HttpService';
import {
  modelcache,
  modelcacheremove,
  MyModelEntity,
  MyModelError,
  MyModelService,
  Pagination
} from "../Core/Services/MyModelService";
import { ParentList } from './PupilService';

export type MessageParams = {
  Title: string;
  Message: string;
  SendToAll: string;
  Status: 'Sent' | 'Draft';
  Type: 'S' | 'T';
  CreatedBy: string | number;
  PupilList: [{ MobileNumber: string | number }];
}

/* Entity */

export class GlobalMessage extends MyModelEntity {

  Title: string;
  Message: string;
  SendToAll: boolean;
  Status: 'Sent' | 'Draft';
  Type: 'S' | 'T';
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string;
  UpdatedBy: string;
  UpdatedDate: string;
  protected PupilList: ParentList[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get pupilList(): ParentList[] {
    if (this.PupilList && this.PupilList.length) {
      return this.PupilList.map((parent) => new ParentList(parent));
    } else {
      return [];
    }
  }

}

/* Model */
export class GlobalMessageService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get All GlobalMessage By ID and Type and Search Params
   * @param id (string | number)
   * @param [type] (type) 
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, messages: GlobalMessage[] }>
   */
  getByIDAndType(id: string | number, type: string, search?: any): Promise<{ pagination: Pagination, messages: GlobalMessage[] }> {
    return new Promise((resolve, reject) => {
      const url = ['globalmessaging', id, type].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _messages = res.data.data.map((teacher) => new GlobalMessage(teacher));
            setTimeout(() => resolve({
              pagination: _pagination,
              messages: _messages
            }), 1000);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All GlobalMessage By School ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, messages: GlobalMessage[] }>
   */
  getBySchoolID(id: string | number, search?: any): Promise<{ pagination: Pagination, messages: GlobalMessage[] }> {
    return this.getByIDAndType(id, 'S', search);
  }

  /**
   * Get All GlobalMessage By Teacher ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, messages: GlobalMessage[] }>
   */
  getByTeacherID(id: string | number, search?: any): Promise<{ pagination: Pagination, messages: GlobalMessage[] }> {
    return this.getByIDAndType(id, 'T', search);
  }

  /**
   * Get GlobalMessage By GlobalMessage ID
   * @param id (string | number)
   * @returns Promise\<GlobalMessage>
   * @modelcache {key: 'getoneglobalmessag/{0}', group: 'SINGLE_GLOBAL_MESSAGE'}
   */
  @modelcache('getoneglobalmessag/{0}', 'SINGLE_GLOBAL_MESSAGE')
  get(id: string | number): Promise<GlobalMessage> {
    return new Promise((resolve, reject) => {
      const url = ['getoneglobalmessag', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new GlobalMessage(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Save Global Message
   * @param params (type MessageParams)
   * @returns Promise\<GlobalMessage>
   */
  create(params: MessageParams): Promise<GlobalMessage> {
    return new Promise((resolve, reject) => {
      const url = ['globalmessaging'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new GlobalMessage(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Update Global Message By Global Message ID
   * @param id (string | number)
   * @param [params] (MessageParams) 
   * @returns Promise\<GlobalMessage>
   * @modelcacheremove {group: 'SINGLE_GLOBAL_MESSAGE'}
   */
  @modelcacheremove('', 'SINGLE_GLOBAL_MESSAGE')
  update(id: string | number, params: MessageParams): Promise<GlobalMessage> {
    return new Promise((resolve, reject) => {
      const url = ['updateglobalmessaging'].join('/');
      const uPlayload: any = params;
      uPlayload.globalmessageId = id;
      Http.post(url, uPlayload)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new GlobalMessage(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All GlobalMessage By Parent Mobile
   * @param mNumber (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, messages: GlobalMessage[] }>
   */
   getParentMessage(mNumber: string | number, search?: any): Promise<{ pagination: Pagination, messages: GlobalMessage[] }> {
    return new Promise((resolve, reject) => {
      const url = ['pupilglobalmessaging', mNumber].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _messages = res.data.data.map((teacher) => new GlobalMessage(teacher));
            setTimeout(() => resolve({
              pagination: _pagination,
              messages: _messages
            }), 1000);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}