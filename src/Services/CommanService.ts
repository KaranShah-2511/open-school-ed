/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { Http } from '../Core/Services/HttpService';
import {
  modelcache,
  MyModelEntity,
  MyModelError,
  MyModelService
} from "../Core/Services/MyModelService";

/* Entity */

export class TeachingYear extends MyModelEntity {

  Title: string;
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

export class Title extends MyModelEntity {

  Title: string;
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}


/* Model */
export class CommanService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get Teaching Year
   * @returns Promise\<TeachingYear[]>
   * @modelcache {key: 'teachingyear', group: 'TEACHING_YEAR'}
   */
  @modelcache('teachingyear', 'TEACHING_YEAR')
  getTeachingYear(): Promise<TeachingYear[]> {
    return new Promise((resolve, reject) => {
      const url = ['teachingyear'].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const teachingYears = res.data.data.map((teachingYear) => new TeachingYear(teachingYear));
            resolve(teachingYears);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Title
   * @returns Promise\<Title[]>
   * @modelcache {key: 'title', group: 'TITLE'}
   */
  @modelcache('title', 'TITLE')
  getTitle(): Promise<Title[]> {
    return new Promise((resolve, reject) => {
      const url = ['title'].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const titles = res.data.data.map((title) => new TeachingYear(title));
            resolve(titles);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}