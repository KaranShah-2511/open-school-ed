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
  MyModelService
} from "../Core/Services/MyModelService";
import { Security } from '../Core/Services/SecurityService';

export type LoginParam = {
  Email: string;
  Password: string;
  UserType: string;
  AccessedVia?: string;
  Device?: string;
  OS?: string | null;
  PushToken?: string;
}

export type SettingParam = {
  SettingList: {
    SettingId: string | number;
    Name: string;
    Value: boolean;
    SubType: string;
    Type: string;
  }[];
}

/* Entity */
export class UserType extends MyModelEntity {

  Name: string;
  Type: string;
  IsActive: boolean;
  CreatedDate: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

export class Children extends MyModelEntity {

  UserId: string | number;
  FirstName: string;
  LastName: string;
  Email: string;
  MobileNumber: number;
  PinPassword: number;
  Pupilid: string | number;
  Dob: string;
  ParentFirstName: string;
  ParentLastName: string;
  ProfilePicture: string;
  UniqueNumber: string;
  Note: string;
  Relationship: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  PostCode: string;
  SchoolId: string;
  SchoolFirstName: string;
  SchoolLastName: string;
  SchoolMobileNumber: string | number;
  SchoolAddressLine1: string;
  SchoolAddressLine2: string;
  SchoolCity: string;
  SchoolPostalCode: string;

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

export class User extends MyModelEntity {

  FirstName: string;
  LastName: string;
  Email: string;
  MobileNumber: number;
  PinPassword: number;
  SchoolId: string;
  QBUserId: string;
  Token: string;
  ProfilePicture: string;
  AvatarIimg: string;
  UserDetialId: string;
  CurrentDate: string;
  private RoomId: string | [{ RoomId: string }];
  private _UserType: string;
  private UserType: string;
  private UserTypeId: string;
  private _PASSWORD: string;
  private ChildrenList: any[];
  private ActivePupil: Children | boolean;
  private ActiveParentZone: Children | null;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get activeParentZone(): Children | null {
    return (this.ActiveParentZone) ? new Children(this.ActiveParentZone) : null;
  }

  setActiveParentZone(val: Children | null) {
    this.ActiveParentZone = val;
  }

  get activePupil(): Children | boolean {
    return (this.ActivePupil) ? new Children(this.ActivePupil) : false;
  }

  setActivePupil(pupil: Children | boolean) {
    this.ActivePupil = pupil;
  }

  setQbUserID(val: any) {
    this.QBUserId = val;
  }

  setPinPassword(val: any) {
    this.PinPassword = val;
  }

  setPassword(val: any) {
    this._PASSWORD = Security.encrypt(val);
  }

  getPassword() {
    return (this._PASSWORD) ? Security.decrypt(this._PASSWORD) : null;
  }

  get FullName(): string {
    return [this.FirstName, this.LastName].join(' ');
  }

  get userType() {
    return new UserType({
      _id: this.UserTypeId,
      Name: this.UserType,
      Type: this._UserType
    });
  }

  get roomId(): string[] {
    return (this.RoomId instanceof Array)
      ? (this.RoomId.length) ? this.RoomId.map((rid) => rid.RoomId) : this.RoomId
      : (this.RoomId) ? [this.RoomId] : [];
  }

  get childrenList(): Children[] {
    if (this.ChildrenList && this.ChildrenList.length) {
      return this.ChildrenList.map((c) => new Children(c));
    } else {
      return [];
    }
  }

}

export class UserSetting extends MyModelEntity {

  SettingId: string;
  Name: string;
  Value: boolean;
  SubType: string;
  Type: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

}

/* Model */
export class UserService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Login
   * @param params (type LoginParam)
   * @returns Promise\<User>
   */
  login(params: LoginParam): Promise<User> {
    return new Promise((resolve, reject) => {
      Http.post('/login', params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new User(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get User Types
   * @returns Promise\<UserType[]>
   */
  @modelcache('usertype', 'USER_TYPE')
  userType(): Promise<UserType[]> {
    return new Promise((resolve, reject) => {
      Http.get('/usertype')
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const utypes = res.data.data.map((utype) => new UserType(utype));
            resolve(utypes);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Get User Setting By ID
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<UserSetting[]>
   * @modelcache {key: 'usersetting/{0}', group: 'USER_SETTING'}
   */
  @modelcache('usersetting/{0}', 'USER_SETTING')
  getUserSetting(id: string | number): Promise<UserSetting[]> {
    return new Promise((resolve, reject) => {
      const url = ['usersetting', id].join('/');
      Http.get(url)
        .then((res) => {
          if (res.data.flag === true) {
            const usettings = res.data.data.map((usetting) => new UserSetting(usetting));
            setTimeout(() => { resolve(usettings); }, 2000);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Save User Setting
   * @param id (string | number)
   * @param [params] (SettingParam)
   * @returns Promise\<any>
   * @modelcacheremove {key: '', group: 'USER_SETTING'}
   */
  @modelcacheremove('', 'USER_SETTING')
  saveSetting(id: string | number, params: SettingParam): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['saveSetting', id].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(res);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Save User Setting
   * @param params ({ UserId: string | number, QBUserId: string | number })
   * @returns Promise\<any>
   */
  setQuickBloxID(params: { UserId: string | number, QBUserId: string | number }): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['setqbuserid'].join('/');
      Http.post(url, params)
        .then((res) => {
          if (res.data.flag === true) {
            resolve(res);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}