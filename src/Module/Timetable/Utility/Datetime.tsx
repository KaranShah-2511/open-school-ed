/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import moment from "moment";
import { timeByStartEnd } from "../../../Core/Utility/Datetime";

export function filterDayWise(items, days) {
  return days.map((day) => {
    day.times = [];
    day.data = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const filterDayWise = item.filterDayWise;
      const StartDate = moment(moment(filterDayWise.StartDate, filterDayWise.DateFormat).format(day.format), day.format);
      const EndDate = moment(moment(filterDayWise.EndDate, filterDayWise.DateFormat).format(day.format), day.format);
      if (
        (day.moment.isBetween(StartDate, EndDate)) ||
        (day.moment.isSame(StartDate)) ||
        (day.moment.isSame(EndDate))
      ) {
        if (item.startDate === undefined) {
          items[index].startDate = day.date;
        }
        if (item.showDates === undefined) {
          items[index].showDates = [];
        }
        items[index].showDates.push(day.date);
        day.data.push(items[index]);
      } else if (
        item.groupDate === undefined &&
        (day.moment.isBetween(StartDate, EndDate) && StartDate.isAfter(day.moment) && day.moment.isBefore(EndDate))
      ) {
        items[index].groupDate = day.date;
        day.data.push(items[index]);
      }
    }
    return day;
  });
}

export function filterTimeWise(days, times) {
  return days.map((day) => {
    if (day.data) {
      const addDataKey: any[] = [];
      for (const time of times) {
        time.data = [];
        let addTimeArr = true;
        let addTime = JSON.parse(JSON.stringify(time));
        for (let i = 0; i < day.data.length; i++) {
          const item = day.data[i];
          const filterTimeWise = item.filterTimeWise;
          if (time.time24Hour >= filterTimeWise.StartTime && filterTimeWise.EndTime >= time.to24Hour) {
            if (addDataKey.length === 0 || !addDataKey.includes(i)) {
              addTime.to = moment(filterTimeWise.EndTime, filterTimeWise.TimeFormat).format('hh:mm A');
              addTime.to24Hour = moment(filterTimeWise.EndTime, filterTimeWise.TimeFormat).format('kk:mm');
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
      // delete day.data;
    }
    if (day.times.length === 0) {
      day.times = times;
    }
    return day;
  });
}