import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { GoClock } from "react-icons/go";
import { MyEvent } from '../../../../Services/EventService';
import { Lesson } from '../../../../Services/LessonService';
import { TimetableDataType, TimetableView } from '../../../../Services/TimetableService';
import './MyTimetable.scss';

type EventViewProps = {
  utype: string;
  event: MyEvent;
  day:boolean;
  callback?: (type: 'event' | 'lesson', data: MyEvent | Lesson) => void;
};

function EventView(props: EventViewProps) {

  const { event, callback ,day} = props;

  const onClick = () => {
    if (callback !== undefined) {
      callback('event', event);
    }
  }

  return (
    <div className="timetable-event" onClick={() => onClick()} style={{ backgroundColor: day ? event.EventColor + '50' : ''  }}>
      <div className="color-area" style={{ backgroundColor: event.EventColor }}></div>
      <div className="event-detail">
        <h5>{event.EventName}</h5>
        <p>
          <GoClock />
          <span>{event.EventStartTime} - {event.EventEndTime}</span>
        </p>
      </div>
    </div>
  );
}

EventView.propTypes = {
  utype: PropTypes.string.isRequired,
  event: PropTypes.object.isRequired,
  callback: PropTypes.func
};

type LessonViewProps = {
  utype: string;
  lesson: Lesson;
  day:boolean;
  callback?: (type: 'event' | 'lesson', data: MyEvent | Lesson) => void;
};

function LessonView(props: LessonViewProps) {

  const { lesson, callback ,day } = props;

  const onClick = () => {
    if (callback !== undefined) {
      callback('lesson', lesson);
    }
  }

  return (
    <div className="timetable-lesson" onClick={() => onClick()} style={{ backgroundColor: day ? lesson.SubjectColor + '50' : '' }}>
      <div className="color-area" style={{ backgroundColor: lesson.SubjectColor }}></div>
      <div className="lesson-detail">
        <h5>{lesson.SubjectName}</h5>
        <p>
          <GoClock />
          <span>{lesson.StartTime} - {lesson.EndTime}</span>
        </p>
      </div>
    </div>
  );
}

LessonView.propTypes = {
  utype: PropTypes.string.isRequired,
  lesson: PropTypes.object.isRequired,
  callback: PropTypes.func
};

type MyTimetableProps = {
  utype: string;
  timetable: TimetableView | undefined;
  callback?: (type: 'event' | 'lesson', data: MyEvent | Lesson) => void;
};

function MyTimetable(props: MyTimetableProps) {

  const { utype, timetable, callback } = props;

  return (
    (timetable)
      ? <>
        <div className="timetable-view">
          <Table responsive>
            <thead>
              <tr>
                <th></th>
                {
                  timetable.Times.map((time, i) => {
                    const attr = {
                      'data-from': time.time24Hour,
                      'data-to': time.to24Hour
                    };
                    return (
                      <th key={i} {...attr}>{time.time24Hour}</th>
                    );
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                timetable.Items.map((day, i) => {
                  return (
                    <tr key={i} className={(day.today) ? 'today' : ''}>
                      <td className="day-label">{day.sortLabel}</td>
                      {
                        day.times.map((time, j) => {
                          const attr: any = {
                            'data-from': time.time24Hour,
                            'data-to': time.to24Hour
                          };
                          if (time.days) { attr.rowSpan = time.days.length; }
                          if (time.times) { attr.colSpan = time.times.length; }
                          return <td key={j} {...attr}>
                            {
                              time.data.map((item, k) => {
                                return (item.Type === TimetableDataType.EVENT)
                                  ? <EventView key={k} event={item.Event} utype={utype} callback={callback} day={day.today} />
                                  : <LessonView key={k} lesson={item.Lesson} utype={utype} callback={callback} day = {day.today} />
                              })
                            }
                          </td>;
                        })
                      }
                    </tr>
                  );
                })
              }
            </tbody>
          </Table>
        </div>
      </>
      : null
  );
}

MyTimetable.propTypes = {
  utype: PropTypes.string.isRequired,
  timetable: PropTypes.object,
  callback: PropTypes.func
};

export default MyTimetable;
