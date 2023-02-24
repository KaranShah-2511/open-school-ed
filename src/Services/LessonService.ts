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
import { Pupil, PupilList } from './PupilService';

export type LessonParam = {
  SubjectId: string | number;
  LessonTopic: string;
  LessonDate: string;
  LessonEndTime: string;
  LessonStartTime: string;
  PupilGroupId: string;
  LessonDescription: string;
  RecordingName: string;
  RecordedLessonName: string;
  ChatTranscript: string;
  IsDeliveredLive: boolean;
  IsPublishBeforeSesson: boolean;
  IsVotingEnabled: boolean;
  QBDilogID: string;
  CreatedBy: string | number;
  PupilList: [{ PupilId: string | number }];
  MaterialList: [{ MaterialName: string }];
  CheckList: [{ ItemName: string }];
  ChannelList:any[];
}

export type LessonFileParam = {
  materiallist?: any[];
  recording?: any[];
}

export type DeleteLessonFileParam = {
  deletematerial?: any[];
  deleterecording?: any[];
  type: "L"
}

/* Entity */
export class Lesson extends MyModelEntity {

  LessonId: string | number;
  LessonTopic: string;
  LessonDescription: string;
  LessonStart: boolean;
  LessonEnd: boolean;
  LessonDate: string;
  LiveSession: boolean;
  SaveLesson: boolean;
  SubjectId: string | number;
  SubjectName: string;
  SubjectColor: string;
  StartTime: string;
  EndTime: string;
  TeacherID: string | number;
  TeacherFirstName: string;
  TeacherLastName: string;
  TeacherProfile: string;
  TeacherUserName: string;
  TeacherQBUserID: string;
  TeacherRoomID: string;
  QBDilogID: string | number;
  Date: string;
  PupilGroupId: string;
  GroupName: string;
  private HomeWork: string;
  Publish: boolean;
  RecordedLessonName: string;
  RecordingList: [{ filename: string, originalname: string }];
  RecommendedList: any[];
  IsVotingEnabled: boolean;
  CheckList: [{ ItemName: string }];
  MaterialList: [{ filename: string, originalname: string }];
  ChannelList : any[];
  WorkSpacelist: [{ filename: string, originalname: string }];;
  protected Allpupillist: any[];
  protected GroupPupilList: any[];
  protected PupilList: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get StartDate() {
    return this.Date;
  }

  get EndDate() {
    return this.Date;
  }

  get TeacherFullName(): string {
    return [this.TeacherFirstName, this.TeacherLastName].join(' ');
  }

  get homeWork(): boolean {
    return (this.HomeWork === 'Yes') ? true : false;
  }

  get pupilList(): Pupil[] {
    if (this.PupilList && this.PupilList.length) {
      return this.PupilList.map((pupil) => new Pupil(pupil));
    } else {
      return [];
    }
  }

  get allPupilList(): PupilList[] {
    if (this.Allpupillist && this.Allpupillist.length) {
      return this.Allpupillist.map((pupil) => new PupilList(pupil));
    } else {
      return [];
    }
  }

  get groupPupilList(): PupilList[] {
    if (this.GroupPupilList && this.GroupPupilList.length) {
      return this.GroupPupilList.map((pupil) => new PupilList(pupil));
    } else {
      return [];
    }
  }

}

export class Subject extends MyModelEntity {

  SchoolId: string | number;
  SubjectName: string;
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string | number;
  SubjectColor: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

/* Model */
export class LessonService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get All Lesson By User ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, lessons: Lesson[] }>
   */
  getAll(id: string | number, search?: any): Promise<{ pagination: Pagination, lessons: Lesson[] }> {
    return new Promise((resolve, reject) => {
      const url = ['getalllesson', id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _lessons = res.data.data.map((lesson) => new Lesson(lesson));
            resolve({
              pagination: _pagination,
              lessons: _lessons
            });
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Lesson By Lesson ID
   * @param id (string | number)
   * @returns Promise\<Lesson>
   * @modelcache {key: 'getonelesson/{0}', group: 'SINGLE_LESSON'}
   */
  @modelcache('getonelesson/{0}', 'SINGLE_LESSON')
  get(id: string | number): Promise<Lesson> {
    return new Promise((resolve, reject) => {
      const url = ['getonelesson', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Lesson(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Subject By School ID
   * @param id (string | number)
   * @returns Promise\<Subject>
   * @modelcache {key: 'subjectbyschoolid/{0}', group: 'SUBJECT'}
   */
  @modelcache('subjectbyschoolid/{0}', 'SUBJECT')
  getSubject(id: string | number): Promise<Subject[]> {
    return new Promise((resolve, reject) => {
      const url = ['subjectbyschoolid', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const subject = res.data.data.map((s) => new Subject(s));
            resolve(subject);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Lesson Homework Add
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  add(params: LessonParam): Promise<Lesson> {
    return new Promise((resolve, reject) => {
      const url = ['lesson'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new Lesson(res.data.data));
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
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  @modelcacheremove('getonelesson/{0}', 'SINGLE_LESSON')
  update(id: string | number, params: LessonParam): Promise<Lesson> {
    return new Promise((resolve, reject) => {
      const url = ['lessonupdate', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(new Lesson(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Lesson Upload Files
   * @param id (string | number)
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  uploadFile(id: string | number, params: LessonFileParam, onUploadProgress?: (progressEvent: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['lessonmaterialupload', id].join('/');
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
   * Lesson Delete Files
   * @param id (string | number)
   * @param params (type LessonParam)
   * @returns Promise\<Lesson>
   */
  deleteFile(id: string | number, params: DeleteLessonFileParam): Promise<any> {
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
   * Get All Lesson By User ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<Lesson[]>
   */
  getAllPupilLesson(id: string | number, search?: any): Promise<Lesson[]> {
    return new Promise((resolve, reject) => {
      const url = ['allpupillessonlist', id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const lessons = res.data.data.map((lesson) => new Lesson(lesson));
            resolve(lessons);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get Pupil Lesson By Lesson ID And Pupil ID
   * @param id (string | number)
   * @param pID (string | number)
   * @returns Promise\<Lesson>
   */
  getPupilLesson(id: string | number, pID: string | number): Promise<Lesson> {
    return new Promise((resolve, reject) => {
      const url = ['getpupillesson', id, pID].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Lesson(res.data.data[0]));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Save Lesson By Lesson ID and Pupil ID
   * @param id (string | number)
   * @param pID (string | number)
   * @param params ({ SaveLesson: boolean })
   * @returns Promise\<boolean>
   */
  saveLesson(id: string | number, pID: string | number, params: { SaveLesson: boolean }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = ['savelessionbypupil', id, pID].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(true);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}
