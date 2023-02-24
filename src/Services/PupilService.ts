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
import { TeacherList } from './TeacherService';

export type PupilRegisterParam = {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  UserType: string;
  Dob: string;
}

export type PupilAddSchoolParam = {
  pupilId: string | number;
  SchoolCode: string | number;
}

export type InsertPupilParam = {
  SchoolId: string | number;
  AddTeacherList: [{ TeacherId: string | number }];
  RemoveTeacherList: [{ TeacherId: string | number }] | any;
  ParentFirstName: string;
  ParentLastName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  MobileNumber: string | number;
  Dob: string;
  UserTypeId: string | number;
  IsInvited: boolean;
  CreatedBy?: string | number;
  UniqueNumber?: string | number;
}

export type ClassSetupParam = {
  SchoolId: string | number;
  TeacherId: string | number;
  PupilList: [{ PupilId: string | number }];
  RemovePupilList: [{ PupilId: string | number }] | any;
  CreatedBy?: string | number;
}

export type GroupSetupParam = {
  GroupName: string;
  TeacherId: string | number;
  PupilList: [{ PupilId: string | number }];
  CreatedBy?: string | number;
}


/* Entity */
export class PupilList extends MyModelEntity {

  PupilId: string | number;
  PupilName: string;
  PupilEmail: string;
  ProfilePicture: string;
  QBUserID: string;
  RoomID: [{ RoomId: string }]

  constructor(data?: any) {
    super(data);
    if (data) {
      this.id = data.PupilId;
      this.objectAssign(this, data);
    }
  }

}

export class ParentList extends MyModelEntity {

  FirstName: string;
  LastName: string;
  ParentFirstName: string;
  ParentLastName: string;
  MobileNumber: string | number;
  UserId: string | number;
  PupilId: string | number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get FullName(): string {
    return [this.FirstName, this.LastName].join(' ');
  }

  get parentFullName(): string {
    return [this.ParentFirstName, this.ParentLastName].join(' ');
  }

}

export class Avatar extends MyModelEntity {

  Type: string;
  imglist: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}
export class Rewards extends MyModelEntity {

  protected Rewards: [{ _id: string | number, count: number }];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get point(): number {
    return (this.Rewards) ? this.Rewards.filter((item) => item._id === 'Point')[0].count : 0;
  }

  get gold(): number {
    return (this.Rewards) ? this.Rewards.filter((item) => item._id === '9')[0].count : 0;
  }

  get silver(): number {
    return (this.Rewards) ? this.Rewards.filter((item) => item._id === '6')[0].count : 0;
  }

  get bronze(): number {
    return (this.Rewards) ? this.Rewards.filter((item) => item._id === '3')[0].count : 0;
  }

}
export class PupilAvatar extends MyModelEntity {

  _id: string | number;
  Type: string;
  Images: string;
  IsActive: boolean;
  CreatedDate: string;
  Point: number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

export class Pupil extends MyModelEntity {

  PupilId: string | number;
  FirstName: string;
  LastName: string;
  ProfilePicture: string;
  PupilName: string;
  ParentFirstName: string;
  ParentLastName: string;
  GroupName: string[];
  TeacherList: [{ Name: string, TeacherId: string | number }];
  QBUserID: string;
  AddressLine1: string;
  AddressLine2: string;
  ClassCode: string;
  Dob: string;
  Email: string;
  Feedback: string;
  IsActive: boolean;
  IsInvited: boolean;
  MobileNumber: string | number;
  SchoolId: string;
  UniqueNumber: string;
  UserId: string;
  isSelected: boolean;
  Note: string;
  Relationship: string;
  RoomID: [{ RoomId: string }];
  protected RewardsList: [{ _id: string | number, count: number }];
  LessonMastercount: {
    TotalLesson: number,
    JoinLesson: number,
    MissedLesson: number,
    Percentage: number,
  };
  HomeworkCount: {
    Total: number,
    Submited: number,
    Percentage: number,
  };

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get FullName(): string {
    return [this.FirstName, this.LastName].join(' ');
  }

  get parentFullName(): string {
    return [this.ParentFirstName, this.ParentLastName].join(' ');
  }

  private getRewardCount = (id: number) => {
    if (this.RewardsList && this.RewardsList.length) {
      for (let ri = 0; ri < this.RewardsList.length; ri++) {
        const reward = this.RewardsList[ri];
        if (Number(reward._id) === id) {
          return reward.count;
        }
      }
    }
    return 0;
  };

  getReward(type: 'bronze' | 'silver' | 'gold') {
    let reward = 0;
    switch (type) {
      case 'bronze':
        reward = this.getRewardCount(3);
        break;
      case 'silver':
        reward = this.getRewardCount(6);
        break;
      default:
        reward = this.getRewardCount(9);
        break;
    }
    return reward;
  }

  get Status(): string {
    return (this.IsActive === true) ? "Active" : "In-Active";
  }

}

export class PupilRegistration extends MyModelEntity {

  UserDetialId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  CreatedDate: string;
  IsActive: boolean;
  hash_password: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

export class ClassSetupListPupil extends MyModelEntity {

  SchoolId: string | number;
  TeacherId: string | number;
  PupilId: string | number;
  ClassStupCode: string;
  TeacherRoomID: string;
  ProfilePicture: string;
  PupilFirstName: string;
  PupilLastName: string;
  PupilUserName: string;
  TeacherFirstName: string;
  TeacherLastName: string;
  TeacherUserName: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get fullName(): string {
    return [this.PupilFirstName, this.PupilLastName].join(' ');
  }

  get teacherFullName(): string {
    return [this.TeacherFirstName, this.TeacherLastName].join(' ');
  }
}

export class ClassSetupList extends MyModelEntity {

  TeacherId: string | number;
  TeacherFirstName: string;
  TeacherLastName: string;
  protected PupilList: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get teacherFullName(): string {
    return [this.TeacherFirstName, this.TeacherLastName].join(' ');
  }


  get pupilList(): ClassSetupListPupil[] {
    if (this.PupilList && this.PupilList.length) {
      return this.PupilList.map((pupil) => new ClassSetupListPupil(pupil));
    } else {
      return [];
    }
  }
}

export class GroupSetupListPupil extends MyModelEntity {

  PupilId: string | number;
  RoomID: [{ RoomId: string }];
  ProfilePicture: string;
  UserID: string | number;
  QBUserID: string | number;
  PupilName: string;
  Email: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

export class GroupSetupList extends MyModelEntity {

  TeacherId: string | number;
  GroupName: string;
  IsActive: boolean;
  protected PupilList: any[];

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get pupilList(): GroupSetupListPupil[] {
    if (this.PupilList && this.PupilList.length) {
      return this.PupilList.map((pupil) => new GroupSetupListPupil(pupil));
    } else {
      return [];
    }
  }
}
export type AvatarParam = {
  AvatarIdList: object;
  // AvatarId: string | number;
}
export type AvatarImageParam = {
  Id:string | number;
  PupilId:string | number;
  Point: number;
}

export class MyAvatar extends MyModelEntity {
  _id: string | number;
  SchoolId: string | number;
  UserId: string | number;
  ParentFirstName: string;
  ParentLastName: string;
  Dob: string;
  ProfilePicture: string;
  UniqueNumber: string;
  IsInvited: boolean;
  IsActive: boolean;
  CreatedDate: string;
  CreatedBy: string | number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

/* Model */
export class PupilService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get All Pupil By School ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, pupiles: Pupil[] }>
   */
  getBySchoolID(id: string | number, search?: any): Promise<{ pagination: Pagination, pupiles: Pupil[] }> {
    return new Promise((resolve, reject) => {
      const url = ['pupilbyschoolid', id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _pupiles = res.data.data.map((pupil) => new Pupil(pupil));
            resolve({
              pagination: _pagination,
              pupiles: _pupiles
            });
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Pupil By Teacher ID and Search Params
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<{ pagination: Pagination, pupiles: Pupil[] }>
   */
  getByTeacherID(id: string | number, search?: any): Promise<{ pagination: Pagination, pupiles: Pupil[] }> {
    return new Promise((resolve, reject) => {
      const url = ['pupilbyteacherid', id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const _pagination = new Pagination(res.data.pagination);
            const _pupiles = res.data.data.map((pupil) => new Pupil(pupil));
            resolve({
              pagination: _pagination,
              pupiles: _pupiles
            });
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Pupil Registration
   * @param params (type PupilRegisterParam)
   * @returns Promise\<PupilRegistration>
   */
  pupilRegister(params: PupilRegisterParam): Promise<PupilRegistration> {
    return new Promise((resolve, reject) => {
      Http.post('/pupilregister', params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new PupilRegistration(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Pupil Add School Code
   * @param params (type PupilAddSchoolParam)
   * @returns Promise\<any>
   */
  pupilAddSchoolCode(params: PupilAddSchoolParam): Promise<any> {
    return new Promise((resolve, reject) => {
      Http.post('/pupilschoolcode', params)
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
   * Get Pupil By Pupil ID
   * @param id (string | number)
   * @returns Promise\<Pupil>
   * @modelcache {key: 'pupil/{0}', group: 'SINGLE_PUPIL'}
   */
  @modelcache('pupil/{0}', 'SINGLE_PUPIL')
  get(id: string | number): Promise<Pupil> {
    return new Promise((resolve, reject) => {
      const url = ['pupil', id].join('/');
      Http.get(url)
        .then((res) => {
          if (/* res.data.code === "200" && */res.data.flag === true) {
            resolve(new Pupil(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Parent By ID and Type and Search Params
   * @param id (string | number)
   * @param [type] (type) 
   * @param [search] (any) 
   * @returns Promise\<ParentList[]>
   */
  getParentListByIDAndType(id: string | number, type: string): Promise<ParentList[]> {
    return new Promise((resolve, reject) => {
      const url = ['parentlist', id, type].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const parentlist = res.data.data.map((parent) => new ParentList(parent));
            resolve(parentlist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Parent By School ID
   * @param id (string | number)
   * @returns Promise\<ParentList[]>
   */
  getParentListBySchoolID(id: string | number): Promise<ParentList[]> {
    return this.getParentListByIDAndType(id, 'S');
  }

  /**
   * Get All Parent By Teacher ID
   * @param id (string | number)
   * @returns Promise\<Parent[]>
   */
  getParentListByTeacherID(id: string | number): Promise<ParentList[]> {
    return this.getParentListByIDAndType(id, 'T');
  }

  /**
   * Get All Class Setup List By School ID
   * @param id (string | number)
   * @returns Promise\<ClassSetupList[]>
   */
  classSetupListBySchoolID(id: string | number): Promise<ClassSetupList[]> {
    return new Promise((resolve, reject) => {
      const url = ['getclasssetup', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const classsetuplist = res.data.data.map((classSetup) => new ClassSetupList(classSetup));
            resolve(classsetuplist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Group Setup List By Teacher ID
   * @param id (string | number)
   * @returns Promise\<GroupSetupList[]>
   */
  groupSetupListByTeacherID(id: string | number): Promise<GroupSetupList[]> {
    return new Promise((resolve, reject) => {
      const url = ['getparticipants', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const groupsetuplist = res.data.data.map((groupSetup) => new GroupSetupList(groupSetup));
            resolve(groupsetuplist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Class Setup Pupil List By School ID
   * @param id (string | number)
   * @returns Promise\<Pupil[]>
   */
  pupilClassSetupBySchoolID(id: string | number): Promise<Pupil[]> {
    return new Promise((resolve, reject) => {
      const url = ['pupilbyclasssetup', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const pupillist = res.data.data.map((pupil) => new Pupil(pupil));
            resolve(pupillist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get All Group Setup Pupil List By Teacher ID
   * @param id (string | number)
   * @returns Promise\<Pupil[]>
   */
  pupilGroupSetupByTeacherID(id: string | number): Promise<Pupil[]> {
    return new Promise((resolve, reject) => {
      const url = ['pupilbygroupsetup', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const pupillist = res.data.data.map((pupil) => new Pupil(pupil));
            resolve(pupillist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Create New Pupil
   * @param params (type InsertPupilParam)
   * @returns Promise\<Pupil>
   */
  create(params: InsertPupilParam): Promise<Pupil> {
    return new Promise((resolve, reject) => {
      const url = ['pupil'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Pupil(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Update Pupil By Pupil ID
   * @param id (string | number)
   * @param [params] (InsertPupilParam) 
   * @returns Promise\<Pupil>
   * @modelcacheremove {group: 'SINGLE_PUPIL'}
   */
  @modelcacheremove('', 'SINGLE_PUPIL')
  update(id: string | number, params: InsertPupilParam): Promise<Pupil> {
    return new Promise((resolve, reject) => {
      const url = ['pupilupdate', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Pupil(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Upload Pupil Profile By Pupil ID
   * @param id (string | number)
   * @param [profile] (any) 
   * @returns Promise\<any>
  * @modelcacheremove {group: 'SINGLE_PUPIL'}
   */
  @modelcacheremove('', 'SINGLE_PUPIL')
  uploadProfile(id: string | number, profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['pupiluploadProfile', id].join('/');
      Http.post(url, { file: profile }, { headers: { 'Content-Type': 'multipart/form-data' } })
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
   * Upload Pupil By School ID
   * @param id (string | number)
   * @param csv (file) 
   * @param onUploadProgress (progressEvent: any) => void
   * @returns Promise\<any>
   * @modelcacheremove {group: 'SINGLE_PUPIL'}
   */
  @modelcacheremove('', 'SINGLE_PUPIL')
  csvBySchoolId(id: string | number, csv: any, onUploadProgress?: (progressEvent: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['pupilupload', id].join('/');
      const config = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: onUploadProgress };
      Http.post(url, { file: csv }, config)
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
   * Class Setup Save
   * @param params (type InsertPupilParam)
   * @returns Promise\<ClassSetupList>
   */
  classSetupSave(params: ClassSetupParam): Promise<ClassSetupList> {
    return new Promise((resolve, reject) => {
      const url = ['classsetup'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new ClassSetupList(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Group Setup Save
   * @param params (type GroupSetupParam)
   * @returns Promise\<ClassSetupList>
   */
  groupSetupSave(params: GroupSetupParam): Promise<GroupSetupList> {
    return new Promise((resolve, reject) => {
      const url = ['groupsetup'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new GroupSetupList(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Group Setup Update
   * @param id (string | number)
   * @param params (type GroupSetupParam)
   * @returns Promise\<GroupSetupList>
   */
  groupSetupUpdate(id: string | number, params: GroupSetupParam): Promise<GroupSetupList> {
    return new Promise((resolve, reject) => {
      const url = ['updategroupsetup', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new GroupSetupList(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }



  /**
   * Group Setup Save
   * @param id (string | number)
   * @returns Promise\<TeacherList[]>
   */
  getTeachersList(id: string | number): Promise<TeacherList[]> {
    return new Promise((resolve, reject) => {
      const url = ['getteacherslist', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const teacherlist = res.data.data.map((teacher) => new TeacherList(teacher));
            resolve(teacherlist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


  /**
 * Get All Avatar by Pupil Id
 * @param id (string | number)
 * @returns Promise\<Avatar[]>
 */
  getAvatars(id: string | number): Promise<Avatar[]> {
    return new Promise((resolve, reject) => {
      const url = ['getallavatar', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const avatarlist = res.data.data.map((avatar) => new Avatar(avatar));
            resolve(avatarlist);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


  /**
  * @param id (string | number)
  * @returns Promise\<Rewards>
  */
  getPupilRewards(id: string | number): Promise<Rewards> {
    return new Promise((resolve, reject) => {
      const url = ['getpupilrewards', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new Rewards({ Rewards: res.data.data }));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


    /**
  * @param id (string | number)
  * @returns Promise\<PupilAvatar[]>
  */
  getPupilAvatar(id: string | number): Promise<PupilAvatar[]> {
    return new Promise((resolve, reject) => {
      const url = ['pupilgetavatar', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.flag === true) {
            const pupilavatar = res.data.data.map((avatar) => new PupilAvatar(avatar));
            resolve(pupilavatar);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


  /**
   * Create or Update Avatar
   * @param id (string | number)
   * @param params (type AvatarParam)
   * @returns Promise\<MyAvatar>
  */
  updataAvatar(id: string | number, params: AvatarParam): Promise<MyAvatar> {
    return new Promise((resolve, reject) => {
      const url = ['updateavatar', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new MyAvatar(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

   /**
   * Open Avatar image with Points
   * @param params (type AvatarImageParam)
   */
    getAvatarImage(params: AvatarImageParam): Promise<any> {
      return new Promise((resolve, reject) => {
        Http.post('getavatarImg', params)
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