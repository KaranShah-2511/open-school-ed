import React, { useState } from 'react';
import { Navbar, Offcanvas } from 'react-bootstrap';
import { enIN } from 'date-fns/locale';
import { DateRangeFocus, DateRangePickerCalendar } from 'react-nice-dates';
import './Calender.scss';

function Calender(props: any) {

  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [focus, setFocus] = useState<DateRangeFocus>('startDate');
  const handleFocusChange = (newFocus: DateRangeFocus) => {
    setFocus(newFocus || 'startDate');
  };

  return (
    <div className="app-calendar">
      <Navbar expand={false}>
        <Navbar.Toggle aria-controls="offcanvasNavbar" />
        <Navbar.Offcanvas id="app-calendar" aria-labelledby="offcanvasNavbarLabel" placement="end">
          <Offcanvas.Body>
            <div className="date-range-picker">
              <DateRangePickerCalendar
                startDate={startDate}
                endDate={endDate}
                focus={focus}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFocusChange={handleFocusChange}
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
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </div>
  );
}

export default Calender;
