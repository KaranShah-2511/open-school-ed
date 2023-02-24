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

export type ChildrenParam = {
  FirstName: string;
  LastName: string;
  ParentFirstName: string;
  ParentLastName: string;
  ParentFullName: string;
  Dob: string;
  Note: string;
  Relationship: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  PostCode: string;
  MobileNumber: number;
  PinPassword: number;
  UpdatedBy: string;
  Password: string;
  UniqueNumber: string;
  Email: string;
}

export type SetPinParam = {
  MobileNumber: number;
  PinPassword: number;
}
/* Entity */

export class PerformanceLesson extends MyModelEntity {
  totallesson: number;
  joinlesson: number;
  percentage: number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

export class PerformanceHomework extends MyModelEntity {
  total: number;
  submited: number;
  percentage: number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}
export class MyPupil extends MyModelEntity {
  FirstName: string;
  LastName: string;
  ParentFirstName: string;
  ParentLastName: string;
  Dob: string;
  Note: string;
  Relationship: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  PostCode: string;
  MobileNumber: number;
  PinPassword: number;
  UpdatedBy: string;
  Password: string;
  Email: string;
  ParentFullName: string;
  ProfilePicture: string;
  UniqueNumber: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}


/* Model */
export class ParentService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Parent Set Pin
   * @param params (SetPinParam)  
   * @returns Promise\<any>
   */
  setPin(params: SetPinParam): Promise<any> {
    return new Promise((resolve, reject) => {
      Http.post('setpin', params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(res.data.data);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Parent Pupil Performance Lesson 
   * @param id (string | number)
   * @returns Promise\<PerformanceLesson>
   */
  getLesson(id: string | number): Promise<PerformanceLesson> {
    return new Promise((resolve, reject) => {
      const url = ['getcountlession', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new PerformanceLesson(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Parent Pupil Performance Homework 
   * @param id (string | number)
   * @returns Promise\<PerformanceHomework>
   */
  getHomework(id: string | number): Promise<PerformanceHomework> {
    return new Promise((resolve, reject) => {
      const url = ['getcounthomework', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new PerformanceHomework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


  /**
   * Update Pupil profile
   * @param id (string | number)
   * @param [params] (ChildrenParam)
   * @returns Promise\<MyPupil>
   */
  updatePupil(id: string | number, params: ChildrenParam): Promise<MyPupil> {
    return new Promise((resolve, reject) => {
      const url = ['updateparent', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new MyPupil(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


}