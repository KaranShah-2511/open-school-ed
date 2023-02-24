import { Http } from '../Core/Services/HttpService';
import {
  MyModelEntity,
  MyModelError,
  MyModelService
} from "../Core/Services/MyModelService";

export type NotificationParam = {
  userid: string | number;
  page: number;
  limit: number;
}

export class MyNotification extends MyModelEntity {

  UserID: string | number;
  NotificationType: string;
  TypeID: string | number;
  Type: string;
  Title: string;
  Description: string;
  SubDesc: string;
  IsSeen: boolean;
  CreatedDate: string;
  CreatedBy: string | number;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }
}

export class MyNotificationService extends MyModelService<any> {
  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get Notification
   * @returns Promise\<MyNotification[]>
   */
  getAll(params: NotificationParam): Promise<MyNotification[]> {
    return new Promise((resolve, reject) => {
      Http.post('getnotifocation', params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const notifications = res.data.data.map((notification) => new MyNotification(notification));
            resolve(notifications);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  deleteNotification(id: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = ['notificationdelete', id].join('/');
      Http.get(url)
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