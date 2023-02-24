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

export type EventParam = {
  EventTypeId: string;
  EventName: string;
  EventLocation: string;
  EventDescription: string;
  EventColor?: string;
  EventDate: string;
  EventStartTime: string;
  EventEndTime: string;
  Active: boolean;
  CreatedBy: string | number;
}

/* Entity */
export class MyEventType extends MyModelEntity {

  EventType: string;
  EventColor: string;
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



export class MyEvent extends MyModelEntity {

  EventTypeId: string;
  EventType: string;
  EventName: string;
  EventLocation: string;
  EventDescription: string;
  EventColor: string;
  EventDate: string;
  EventStartTime: string;
  EventEndTime: string;
  Active: boolean;

  constructor(data?: any) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
    }
  }

  get StartDate() {
    return this.EventDate;
  }

  get EndDate() {
    return this.EventDate;
  }

}

/* Model */
export class MyEventService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get Event Types
   * @returns Promise\<MyEventType[]>
   */
  eventType(): Promise<MyEventType[]> {
    return new Promise((resolve, reject) => {
      Http.get('eventtype')
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const etypes = res.data.data.map((etype) => new MyEventType(etype));
            resolve(etypes);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

  /**
   * Create new Calender Event
   * @returns Promise\<MyEvent[]>
   */
  addEvent(params: EventParam): Promise<MyEvent> {
    return new Promise((resolve, reject) => {
      Http.post('calenderevent', params)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            resolve(new MyEvent(res.data.data));
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }


}