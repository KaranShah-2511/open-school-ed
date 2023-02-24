import React, { useState, useEffect } from 'react'
import { Navbar, Offcanvas } from 'react-bootstrap';
import { enIN } from 'date-fns/locale';
import { DatePickerCalendar } from 'react-nice-dates';
import moment from 'moment';
import './Calender.scss'

function Calender(props: any) {

  const { fetchData } = props;
  const [date, setDate] = useState<any>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [lessons, setLessons] = useState({});
  const [events, setEvents] = useState({});

  useEffect(() => {
    (async () => {
      if (fetchData) {
        const _lessons = {};
        const _events = {};
        await fetchData.filter((item) => {
          if (item.Type === 'Lesson') {
            const lDate = moment(item.Lesson.Date).format('YYYY-MM-DD');
            if (!_lessons[lDate]) {
              _lessons[lDate] = [];
            }
            _lessons[lDate].push(item.Lesson);
          }
          if (item.Type === 'Event') {
            const eDate = moment(item.Event.EventDate).format('YYYY-MM-DD');
            if (!_events[eDate]) {
              _events[eDate] = [];
            }
            _events[eDate].push(item.Event);
          }
        });
        setLessons(_lessons);
        setEvents(_events);
        setLoading(false);
      } else {
        setLoading(false);
      }
    })();
  }, [fetchData]);

  const modifiers = {
    mylesson: (date) => {
      const da = moment(date).format('YYYY-MM-DD');
      return (lessons[da])? true : false;
    },
    myevent: (date) => {
      const da = moment(date).format('YYYY-MM-DD');
      return (events[da])? true : false;
    }
  }

  const modifiersClassNames = {
    mylesson: '-mylesson',
    myevent: '-myevent'
  };

  return (
    <div className="app-calendar">
      <Navbar expand={false}>
        <Navbar.Toggle aria-controls="offcanvasNavbar" />
        <Navbar.Offcanvas id="app-calendar" aria-labelledby="offcanvasNavbarLabel" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Calender</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {
              (!loading)
                ? <>
                  <div className="date-range-picker">
                    <DatePickerCalendar
                      modifiers={modifiers}
                      modifiersClassNames={modifiersClassNames}
                      date={date}
                      onDateChange={(d) => {
                        setDate(d);
                      }}
                      locale={enIN}
                    />
                  </div>
                  <div className="app-calendar-legend">
                    <ul>
                      <li>
                        <span className="legend-box class"></span>
                        <span className="legend-data">Class</span>
                      </li>
                      <li>
                        <span className="legend-box homework"></span>
                        <span className="legend-data">Homework</span>
                      </li>
                      <li>
                        <span className="legend-box personal"></span>
                        <span className="legend-data">Personal</span>
                      </li>
                    </ul>
                  </div>
                </>
                : ''
            }
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </div>
  )
}

export default Calender
