import { Http } from '../Core/Services/HttpService';
import {
  MyModelEntity,
  MyModelError,
  MyModelService
} from "../Core/Services/MyModelService";

export type SchoolDetailParam = {
  SchoolName: string;
  UniqueLink: string;
  TeacherName: string;
  SchoolContactNo: number;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  PostCode: string;
}


export class MySchoolDetail extends MyModelEntity {

  AddressLine1: string;
  AddressLine2: string;
  City: string;
  PostCode: string;
  UniqueNumber: string;
  IsActive: boolean;
  CreatedDate: string;
  UserId: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

export class SchoolService extends MyModelService<any> {

  /**
    * Get School By School ID
    * @param id (string | number)
    * @returns Promise\<MySchoolDetail>
    */
  getSchoolDetail(id: string | number): Promise<MySchoolDetail> {
    return new Promise((resolve, reject) => {
      const url = ['school', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new MySchoolDetail(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}