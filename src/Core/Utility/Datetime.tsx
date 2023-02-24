/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import moment from "moment";

export interface TimeByStartEnd {
  time: string;
  time24Hour: string;
  to: string;
  to24Hour: string;
  interverl: number;
  interverlUnit: string;
};

export function timeByStartEnd(startTime: string, endTime: string, interverl = 1): TimeByStartEnd[] {
  const items: TimeByStartEnd[] = [];
  let sTime = moment(startTime, 'hh:mm A');
  const eTime = moment(endTime, 'hh:mm A');
  if (!interverl) { interverl = 1; }
  do {
    let item = {
      time: sTime.format('hh:mm A'),
      time24Hour: sTime.format('kk:mm'),
      interverl: interverl,
      interverlUnit: 'm',
      to: '',
      to24Hour: '',
    };
    sTime = sTime.add(interverl, 'm');
    item.to = sTime.format('hh:mm A');
    item.to24Hour = sTime.format('kk:mm');
    items.push(item);
  }
  while (sTime.format('hh:mm A') !== eTime.format('hh:mm A'));
  return items;
};

export interface WeekDays {
  format: string;
  date: string;
  day: number;
  label: string;
  sortLabel: string;
  month: number;
  year: number;
  today: boolean;
  tomorrow: boolean;
  yesterday: boolean;
  moment: moment.Moment;
};

export function weekDays(date: string, format = 'DD/MM/YYYY', displayFormat = 'DD/MM/YYYY'): WeekDays[] {
  const items: WeekDays[] = [];
  const toDay = moment();
  const tomorrowDate = moment().add(1, 'd');
  const yesterdayDate = moment().add(-1, 'd');
  let mDate = moment(moment(date, format)).isoWeekday(1);
  for (var i = 0; i < 7; i++) {
    const response: WeekDays = {
      format: displayFormat,
      date: mDate.format(displayFormat),
      day: Number(mDate.format('DD')),
      label: mDate.format('dddd'),
      sortLabel: mDate.format('ddd'),
      month: Number(mDate.format('MM')),
      year: mDate.year(),
      today: (toDay.format(displayFormat) === mDate.format(displayFormat)),
      tomorrow: (tomorrowDate.format(displayFormat) === mDate.format(displayFormat)),
      yesterday: (yesterdayDate.format(displayFormat) === mDate.format(displayFormat)),
      moment: moment(mDate.format(displayFormat), displayFormat)
    };
    items.push(response);
    mDate = mDate.add(1, 'd');
  }
  return items;
};