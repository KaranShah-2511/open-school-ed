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

export type LessonHomeworkParam = {
  LessonId: string | number;
  IsIncluded: boolean;
  DueDate: string;
  HomeworkDescription: string;
  CreatedBy: string | number;
  CheckList: [{ ItemName: string, IsCheck: boolean }];
  ChannelList:any[];
}

export type LessonHomeworkFileParam = {
  materiallist?: any[];
  recording?: any[];
}

export type DeleteHomeworkFileParam = {
  deletematerial?: any[];
  deleterecording?: any[];
  type: "H"
}

export type HomeworkMarkedParam = {
  recording?: any[];
  Feedback: any[];
  Rewards: string;
}

/* Entity */
export class Homework extends MyModelEntity {

  HomeWorkId: string | number;
  LessonId: string | number;
  SubjectId: string | number;
  SubjectName: string;
  SubjectColor: string;
  GroupName: string;
  LessonTopic: string;
  HomeworkDescription: string;
  HomeWorkDate: string;
  DueDate: string;
  StartTime: string;
  EndTime: string;
  TeacherFirstName: string;
  TeacherLastName: string;
  TeacherProfile: string;
  PupilId: string | number;
  PupilName: string;
  ProfilePicture: string;
  CheckList: [{ ItemName: string, IsCheck: boolean }];
  Submited: boolean;
  SubmitedDate: string;
  Marked: boolean;
  Feedback: string;
  Rewards: string;
  HomeworkList: [{ filename: string, originalname: string }];
  RecordingList: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.id = data.HomeWorkId || 0;
      this.objectAssign(this, data);
    }
  }

  get TeacherFullName(): string {
    return [this.TeacherFirstName, this.TeacherLastName].join(' ');
  }

}

export class LessonHomework extends MyModelEntity {

  LessonId: string | number;
  IsIncluded: boolean;
  DueDate: string;
  HomeworkDescription: string;
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string | number;
  RecordingList: [{ filename: string, originalname: string }];
  MaterialList: [{ filename: string, originalname: string }];
  CheckList: [{ ItemName: string, IsCheck: boolean }];
  PupilList: any[];
  ChannelList : any[];
  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

/* Model */
export class HomeworkService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get Submited Homework List By Lesson ID
   * @param id (string | number)
   * @returns Promise\<MyClass[]>
   */
  getSubmitedListByLessonID(id: string | number, search?: any): Promise<{ pagination: Pagination, homeworkList: Homework[] }> {
    return new Promise((resolve, reject) => {
      const _url = ['homeworksubmited', id].join('/');
      Http.post(_url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data?.pagination);
            const _homeworkList = res.data.data.map((homework) => new Homework(homework));
            resolve({
              pagination: _pagination,
              homeworkList: _homeworkList
            });
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Homework By Lesson ID and Pupil ID
   * @param LessonID (string | number)
   * @param PupilID (string | number)
   * @returns Promise\<Homework>
   */
  getByLessonIDAndPupilID(lID: string | number, pID: string | number): Promise<Homework> {
    return new Promise((resolve, reject) => {
      const url = ['getpupilhomework', lID, pID].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Homework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Homework By Lesson ID
   * @param id (string | number)
   * @returns Promise\<LessonHomework>
   */
  getByLessonID(id: string | number): Promise<LessonHomework> {
    return new Promise((resolve, reject) => {
      const url = ['homework', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new LessonHomework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Lesson Homework Add
   * @param params (type LessonHomeworkParam)
   * @returns Promise\<LessonHomework>
   */
  add(params: LessonHomeworkParam): Promise<LessonHomework> {
    return new Promise((resolve, reject) => {
      const url = ['homework'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new LessonHomework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Lesson Homework Update
   * @param id (string | number)
   * @param params (type LessonHomeworkParam)
   * @returns Promise\<LessonHomework>
   */
  update(id: string | number, params: LessonHomeworkParam): Promise<LessonHomework> {
    return new Promise((resolve, reject) => {
      const url = ['homeworkupdate', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new LessonHomework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Lesson Homework Upload Files
   * @param id (string | number)
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  uploadFile(id: string | number, params: LessonHomeworkFileParam, onUploadProgress?: (progressEvent: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['homeworkmaterialupload', id].join('/');
      const config = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: onUploadProgress };
      Http.post(url, params, config)
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
   * Homework Delete Files
   * @param id (string | number)
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  deleteFile(id: string | number, params: DeleteHomeworkFileParam): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['deleteuplodfile', id].join('/');
      Http.post(url, params)
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
   * Lesson Marked Homework Homework ID and PupilID
   * @param id (string | number)
   * @param pID (string | number)
   * @param params (type HomeworkMarkedParam)
   * @returns Promise\<Homework>
   */
  markedHomework(id: string | number, pID: string | number, params: HomeworkMarkedParam, onUploadProgress?: (progressEvent: any) => void): Promise<Homework> {
    return new Promise((resolve, reject) => {
      const url = ['teacherMarkedHomework', id, pID].join('/');
      const config = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: onUploadProgress };
      Http.post(url, params, config)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Homework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Homework By Pupil ID
   * @param id (string | number)
   * @returns Promise\<Homework[]>
   */
  getByPupilID(id: string | number): Promise<Homework[]> {
    return new Promise((resolve, reject) => {
      const url = ['pupilhomeworklist', id].join('/');
      Http.get(url,)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const homeworks = res.data.data.map((homework) => new Homework(homework));
            resolve(homeworks);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Homework By User ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<Homework[]>
   */
  getAllPupilHomework(id: string | number, search?: any): Promise<Homework[]> {
    return new Promise((resolve, reject) => {
      const url = ['allpupilhomeworklist', id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const homeworks = res.data.data.map((homework) => new Homework(homework));
            resolve(homeworks);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Pupil Homework By Lesson ID And Pupil ID
   * @param id (string | number)
   * @param pID (string | number)
   * @returns Promise\<Homework>
   */
  @modelcache('getpupilhomework/{0}/{1}', 'PUPIL_HOMEWORK')
  getPupilHomework(id: string | number, pID: string | number): Promise<Homework> {
    return new Promise((resolve, reject) => {
      const url = ['getpupilhomework', id, pID].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Homework(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Upload Homework By Homework ID And Pupil ID
   * @param id (string | number)
   * @param pID (string | number)
   * @param params (string | number)
   * @param onUploadProgress (progressEvent: any) => void
   * @returns Promise\<any>
   */
  @modelcacheremove('', 'PUPIL_HOMEWORK')
  uploadHomework(id: string | number, pID: string | number, params: any, onUploadProgress?: (progressEvent: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['uploadhomework', id, pID].join('/');
      const config = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: onUploadProgress };
      Http.post(url, params, config)
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

}