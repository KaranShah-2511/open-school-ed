/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { Http } from "../Core/Services/HttpService";
import {
  modelcache,
  modelcacheremove,
  MyModelEntity,
  MyModelError,
  MyModelService,
  Pagination,
} from "../Core/Services/MyModelService";

export type InsertTeacherParam = {
  SchoolId: string | number;
  Title: string;
  FirstName: string;
  LastName: string;
  Email: string;
  UserTypeId: string | number;
  TeachingYear: string;
  IsInvited: boolean;
  CreatedBy?: string | number;
  UniqueNumber?: string | number;
};

export type RewardsParam = {
  TeacherID: string | number;
  PupilID: string | number;
  Reward: number;
  Feedback: string;
  CreatedBy: string | number;
};
export type ChannelParam = {
  Searchby?: string;
  Filterby?: string;
  page?: number;
  limit?: number;
};
/* Entity */

export class Teacher extends MyModelEntity {
  TeacherId: string | number;
  SchoolId: string | number;
  UserId: string | number;
  TitleId: string | number;
  TitleName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  TeachingYearId: string | number;
  TeachingYear: string;
  ProfilePicture: string;
  UniqueNumber: string;
  IsInvited: boolean;
  Active: boolean;
  HomeworkSet: number;
  HomeworkSubmited: number;
  PreviousLesson: number;
  ScheduledLesson: number;
  ActivePupile: number;
  InActivePupile: number;
  HomeworkCount: number;
  LessonCount: number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get FullName(): string {
    return [this.TitleName, this.FirstName, this.LastName].join(" ").trim();
  }

  get Status(): string {
    return this.Active === true ? "Active" : "In-Active";
  }
}

export class TeacherList extends MyModelEntity {
  TeacherID: string | number;
  TeacherFirstName: string;
  TeacherLastName: string;
  TeacherMobileNumber: string;
  TeacherAddressLine1: string;
  TeacherAddressLine2: string;
  TeacherCity: string;
  TeacherPostalCode: string;
  ProfilePicture: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get FullName(): string {
    return [this.TeacherFirstName, this.TeacherLastName].join(" ").trim();
  }
}

export class InstantReward extends MyModelEntity {
  _id: string | number;
  TeacherID: string | number;
  PupilID: string | number;
  Reward: number;
  Feedback: string;
  CreatedDate: string;
  CreatedBy: string | number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}
export class ChannelData extends MyModelEntity {
  _id: string | number;
  ChannelUsersId: string | number;
  VideoId: string | number;
  ChannelTitle: string;
  Title: string;
  Tags: string[];
  Description: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

/* Model */
export class TeacherService extends MyModelService<any> {
  constructor(url?: string) {
    super();
    super.setUrl(url || "");
  }

  /**
   * Get All Teacher By School ID and Search Params
   * @param id (string | number)
   * @param [search] (any)
   * @returns Promise\<{ pagination: Pagination, teachers: Teacher[] }>
   */
  getBySchoolID(
    id: string | number,
    search?: any
  ): Promise<{ pagination: Pagination; teachers: Teacher[] }> {
    return new Promise((resolve, reject) => {
      const url = ["teacherbyschoolid", id].join("/");
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _teachers = res.data.data.map(
              (teacher) => new Teacher(teacher)
            );
            resolve({
              pagination: _pagination,
              teachers: _teachers,
            });
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Get Teacher By Teacher ID
   * @param id (string | number)
   * @returns Promise\<Teacher>
   * @modelcache {key: 'teacherdetails/{0}', group: 'SINGLE_TEACHER'}
   */
  @modelcache("teacherdetails/{0}", "SINGLE_TEACHER")
  get(id: string | number): Promise<Teacher> {
    return new Promise((resolve, reject) => {
      const url = ["teacherdetails", id].join("/");
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Teacher(res.data.data));
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Get Drop Down Teachers By School ID
   * @param id (string | number)
   * @returns Promise\<Teacher[]>
   */
  getDropDownBySchoolID(id: string | number): Promise<Teacher[]> {
    return new Promise((resolve, reject) => {
      const url = ["teacherdownbyschoolid", id].join("/");
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const teachers = res.data.data.map(
              (teacher) => new Teacher(teacher)
            );
            resolve(teachers);
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Create New Teacher
   * @param params (type InsertTeacherParam)
   * @returns Promise\<Teacher>
   */
  create(params: InsertTeacherParam): Promise<Teacher> {
    return new Promise((resolve, reject) => {
      const url = ["teacher"].join("/");
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Teacher(res.data.data));
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Update Teacher By Teacher ID
   * @param id (string | number)
   * @param [params] (InsertTeacherParam)
   * @returns Promise\<Teacher>
   * @modelcacheremove {group: 'SINGLE_TEACHER'}
   */
  @modelcacheremove("", "SINGLE_TEACHER")
  update(id: string | number, params: InsertTeacherParam): Promise<Teacher> {
    return new Promise((resolve, reject) => {
      const url = ["teacherupdate", id].join("/");
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Teacher(res.data.data));
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Upload Teacher Profile By Teacher ID
   * @param id (string | number)
   * @param [profile] (file)
   * @returns Promise\<any>
   * @modelcacheremove {group: 'SINGLE_TEACHER'}
   */
  @modelcacheremove("", "SINGLE_TEACHER")
  uploadProfile(id: string | number, profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ["teacheruploadProfile", id].join("/");
      Http.post(
        url,
        { file: profile },
        { headers: { "Content-Type": "multipart/form-data" } }
      )
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(res.data.data);
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Upload Teacher By School ID
   * @param id (string | number)
   * @param csv (file)
   * @param onUploadProgress (progressEvent: any) => void
   * @returns Promise\<any>
   * @modelcacheremove {group: 'SINGLE_TEACHER'}
   */
  @modelcacheremove("", "SINGLE_TEACHER")
  csvBySchoolId(
    id: string | number,
    csv: any,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ["teacherupload", id].join("/");
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onUploadProgress,
      };
      Http.post(url, { file: csv }, config)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(res.data.data);
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }

  /**
   * Add Instant Reward
   * @returns Promise\<InstantReward>
   */

  addInstantReward(params: RewardsParam): Promise<InstantReward> {
    return new Promise((resolve, reject) => {
      Http.post("addinstantreward", params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new InstantReward(res.data.data));
          } else {
            reject(new MyModelError("client", res.data));
          }
        })
        .catch((e) => reject(new MyModelError("server", e)));
    });
  }


  /**
   * Get all channel 
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, channels: ChannelData[] }>
   */
  channelUser( search?: any): Promise<{ pagination: Pagination, channels: ChannelData[] }> {
    return new Promise((resolve, reject) => {
      Http.post('channelUser', search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _channelas = res.data.data.map((channel) => new ChannelData(channel));
            resolve({
              pagination: _pagination,
              channels: _channelas
            });
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }
}
