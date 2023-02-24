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
import { WeekDays, TimeByStartEnd, timeByStartEnd } from './../Core/Utility/Datetime';
import { Lesson } from './LessonService';
import { MyEvent } from './EventService';
import { cloneDeep } from 'lodash';
import moment from 'moment';

/** Type / interface */
export enum TimetableDataType {
  EVENT = 'Event',
  LESSON = 'Lesson'
}

export interface TimetableTimes extends TimeByStartEnd {
  data: Timetable[];
  times: TimeByStartEnd[];
  days: any[];
}

export interface TimetableDays extends WeekDays {
  times: TimetableTimes[];
  data: Timetable[];
}

export interface TimetableItem extends TimetableDays { }

/* Entity */
export class Timetable extends MyModelEntity {

  Type: TimetableDataType;
  Event: MyEvent;
  Lesson: Lesson;
  startDate: any;
  showDates: any[] = [];
  groupDate: any;

  constructor(data?: { _id?: string, Type: TimetableDataType, Event?: any, Lesson?: any }) {
    super(data);
    if (data) {
      this.Type = data.Type;
      if (this.Type === TimetableDataType.EVENT && data.Event) {
        this.Event = new MyEvent(data.Event);
      }
      if (this.Type === TimetableDataType.LESSON && data.Lesson) {
        this.Lesson = new Lesson(data.Lesson);
      }
    }
  }

  get Date(): { dateFormat: string, startDate: string, endDate: string } {
    const startDate = (this.Type === 'Event') ? this.Event.StartDate : this.Lesson.StartDate;
    const endDate = (this.Type === 'Event') ? this.Event.EndDate : this.Lesson.EndDate;
    return {
      dateFormat: 'DD/MM/YYYY',
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    };
  }

  get Time(): { timeFormat: string, startTime: string, endTime: string } {
    const startTime = (this.Type === 'Event') ? this.Event.EventStartTime : this.Lesson.StartTime;
    const endTime = (this.Type === 'Event') ? this.Event.EventEndTime : this.Lesson.EndTime;
    return {
      timeFormat: 'kk:mm',
      startTime: startTime,
      endTime: endTime
    };
  }

}

export class TimetableView extends MyModelEntity {

  Days: TimetableDays[];
  Times: TimetableTimes[];
  TimetableData: Timetable[];
  private filterData: TimetableItem[];

  constructor(data?: { Days: WeekDays[], Times: TimeByStartEnd[], TimetableData: Timetable[] }) {
    super(data);
    if (data) {
      this.objectAssign(this, data);
      this.filterTimetableWise();
    }
  }

  get Items(): TimetableItem[] {
    return this.filterData;
  }

  private filterTimetableWise(): void {
    if (this.TimetableData.length && this.Days.length && this.Times.length) {
      const filterDayWise = this.filterDayWise(cloneDeep(this.TimetableData), cloneDeep(this.Days));
      this.filterData = this.filterTimeWise(filterDayWise, cloneDeep(this.Times));
    } else {
      this.filterData = [];
    }
  };

  private filterDayWise(items: Timetable[], days: TimetableDays[]): TimetableItem[] {
    return days.map((day) => {
      day.times = [];
      day.data = [];
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const startDate = moment(moment(item.Date.startDate, item.Date.dateFormat).format(day.format), day.format);
        const endDate = moment(moment(item.Date.startDate, item.Date.dateFormat).format(day.format), day.format);
        if (
          (day.moment.isBetween(startDate, endDate)) ||
          (day.moment.isSame(startDate)) ||
          (day.moment.isSame(endDate))
        ) {
          if (item.startDate === undefined) {
            items[index].startDate = day.date;
          }
          items[index].showDates.push(day.date);
          day.data.push(items[index]);
        } else if (
          item.groupDate === undefined &&
          (day.moment.isBetween(startDate, endDate) && startDate.isAfter(day.moment) && day.moment.isBefore(endDate))
        ) {
          items[index].groupDate = day.date;
          day.data.push(items[index]);
        }
      }
      return day;
    });
  };

  private filterTimeWise(days: TimetableDays[], times: TimetableTimes[]): TimetableItem[] {
    return days.map((day) => {
      if (day.data) {
        const addDataKey: any[] = [];
        for (const time of times) {
          time.data = [];
          let addTimeArr = true;
          let addTime: TimetableTimes = JSON.parse(JSON.stringify(time));
          for (let i = 0; i < day.data.length; i++) {
            const item = day.data[i];
            if (time.time24Hour >= item.Time.startTime && item.Time.endTime >= time.to24Hour) {
              if (addDataKey.length === 0 || !addDataKey.includes(i)) {
                addTime.to = moment(item.Time.endTime, item.Time.timeFormat).format('hh:mm A');
                addTime.to24Hour = moment(item.Time.endTime, item.Time.timeFormat).format('kk:mm');
                addTime.times = timeByStartEnd(addTime.time, addTime.to, addTime.interverl);
                addTime.days = (addTime.days === undefined)
                  ? item.showDates
                  : (item.showDates.length > addTime.days.length) ? item.showDates : addTime.days;
                if (item.startDate === day.date) {
                  addTime.data.push(item);
                  addDataKey.push(i);
                } else {
                  addTimeArr = false;
                }
              } else {
                addTimeArr = false;
              }
            }
          }
          if (addTimeArr) {
            day.times.push(addTime);
          }
        }
      }
      if (day.times.length === 0) {
        day.times = times;
      }
      return day;
    });
  }
}

/* Model */
export class TimetableService extends MyModelService<any> {

  constructor(url?: string) {
    super();
    super.setUrl(url || '');
  }

  /**
   * Get All Timetable By Type, User ID and Search Params
   * @param type teacher | pupil
   * @param id (string | number)
   * @param [search] (any) 
   * @returns Promise\<Timetable[]>
   */
  get(type: 'teacher' | 'pupil', id: string | number, search?: any): Promise<Timetable[]> {
    return new Promise((resolve, reject) => {
      let url = (type === 'teacher') ? 'gettimetable' : 'gettimetablepupil';
      url = [url, id].join('/');
      Http.post(url, search)
        .then((res) => {
          if (res.data.code === "200" && res.data.flag === true) {
            const timetableData = res.data.data.map((tdata) => {
              if (tdata.Type === 'Event') {
                return new Timetable({ _id: tdata?._id, Type: TimetableDataType.EVENT, Event: tdata });
              } else {
                return new Timetable({ _id: tdata?._id, Type: TimetableDataType.LESSON, Lesson: tdata });
              }
            });
            resolve(timetableData);
          } else {
            reject(new MyModelError('client', res.data));
          }
        })
        .catch((e) => reject(new MyModelError('server', e)));
    });
  }

}