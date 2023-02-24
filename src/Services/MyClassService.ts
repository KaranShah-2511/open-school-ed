/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { Http } from '../Core/Services/HttpService';
import {
  MyModelEntity,
  MyModelError,
  MyModelService
} from "../Core/Services/MyModelService";
import { PupilList } from './PupilService';

/* Entity */
export class MyClass extends MyModelEntity {

  LessonTopic: string;
  Date: string;
  SubjectColor: string;
  SubjectName: string;
  GroupName: string;
  StartTime: string;
  EndTime: string;
  LessonDescription: string;
  CheckList: [{ ItemName: string }];
  MaterialList: [{ filename: string, originalname: string }];
  protected Allpupillist: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get allPupilList(): PupilList[] {
    if (this.Allpupillist && this.Allpupillist.length) {
      return this.Allpupillist.map((pupil) => new PupilList(pupil));
    } else {
      return [];
    }
  }

}

/* Model */
export class MyClassService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  private fetchByUrlAndID(url, id, search?: any): Promise<MyClass[]> {
    return new Promise((resolve, reject) => {
      const _url = [url, id].join('/');
      Http.post(_url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const myClasses = res.data.data.map((myClass) => new MyClass(myClass));
            resolve(myClasses);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Classes By Teacher ID
   * @param id (string | number)
   * @returns Promise\<MyClass[]>
   */
  getByTeacherID(id: string | number, search?: any): Promise<MyClass[]> {
    return this.fetchByUrlAndID('getmydayteacher', id, search);
  }

  /**
   * Get All Classes By Pupil ID
   * @param id (string | number)
   * @returns Promise\<MyClass[]>
   */
  getByPupilID(id: string | number, search?: any): Promise<MyClass[]> {
    return this.fetchByUrlAndID('getmydaypupil', id, search);
  }

}