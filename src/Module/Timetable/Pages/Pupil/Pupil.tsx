import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { timeByStartEnd, TimeByStartEnd, weekDays, WeekDays } from '../../../../Core/Utility/Datetime';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import MyTimetable from '../../Components/MyTimetable/MyTimetable';
import { Timetable, TimetableService, TimetableView } from '../../../../Services/TimetableService';
import { AddEventModel, EventModel, LessonModel } from '../../Components/Popup';
import { Helmet } from 'react-helmet-async';
import { Button } from 'react-bootstrap';
import { useLayout } from '../../../../Core/Providers';
import ImgNoCalendat from '../../../../Assets/Images/Svg/no-calendar.svg';
import Image from '../../../../Components/Image';
import { Dropdown, Form, Table } from 'react-bootstrap';
import { RiSearchLine } from 'react-icons/ri';
import { BsFunnel, BsPlusLg } from 'react-icons/bs';
import Calender from '../../Components/Calender';
import './Pupil.scss';
import _ from 'lodash';

type HeadingProps = {
  loading: boolean;
}

function Heading(props: HeadingProps) {
  const date: any = moment();
  return <>
    <Helmet>
      <title>
        Timetable
      </title>
    </Helmet>
    <h2 className="header-title">
      Timetable - {moment(date).format('DD/MM/YYYY')}
    </h2>
  </>;
};

Heading.propTypes = {
  loading: PropTypes.bool
};

type AfterHeaderProps = {
  defaultSearch?: object;
  onSearch?: ((search: object) => void);
  setShowAddEvent?: any;
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultSearch, onSearch, setShowAddEvent } = props;
  const [search, setSearch] = useStateMounted<any>();
  const [activeFilter, setActiveFilter] = useStateMounted("Subject");


  const onSearchCall = (sparam) => {
    if (onSearch !== undefined) {
      onSearch(sparam);
    }
  }

  const onFilterBy = async (key) => {
    if (search?.Filterby !== key) {
      setActiveFilter(key.charAt(0).toUpperCase() + key.slice(1));
      setSearch((prevSearch) => {
        const data = { ...prevSearch, Filterby: key };
        onSearchCall(data);
        return data
      });
    }
  }

  const changeSearchby = (e) => {
    if (search?.Searchby !== e.target.value.trim()) {
      setSearch((prevSearch) => {
        return { ...prevSearch, Searchby: e.target.value.trim() };
      });
    }
  }

  const onSubmit = (e) => {
    e.preventDefault();
    onSearchCall(search);
  }

  useEffect(() => {
    setSearch(defaultSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearch]);

  return <>
    <div className="app-header-tab-filter d-block">
      <div className="header-filter filter-other">
        <div className="filter-search" style={{ width: '74%' }}>
          <Form onSubmit={onSubmit}>
            <Form.Group className="filter-search-input" controlId="Searchby">
              <button type='submit' className="search-btn"><RiSearchLine /></button>
              <Form.Control
                placeholder="Search Subject,Class,etc..."
                type="text"
                name="Searchby"
                onChange={changeSearchby}
                value={search?.Searchby || ''}
              />
            </Form.Group>
          </Form>
        </div>
        <div className="filter-by">
          <Dropdown className="filter-dropdown" onSelect={onFilterBy}>
            <Dropdown.Toggle variant="outline-secondary">By {activeFilter} <BsFunnel /></Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Subject" active={(search?.Filterby === "Subject")}>Subject</Dropdown.Item>
              <Dropdown.Item eventKey="Date" active={(search?.Filterby === "Date")}>Date</Dropdown.Item>
              <Dropdown.Item eventKey="LiveLesson" active={(search?.Filterby === "LiveLesson")}>LiveLesson</Dropdown.Item>
              <Dropdown.Item eventKey="PublishLesson" active={(search?.Filterby === "PublishLesson")}>PublishLesson</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Button className="mr-1 save-btn" onClick={(e) => setShowAddEvent(true)} variant="success" type="button"><BsPlusLg /> Add Event</Button>
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultSearch: PropTypes.object,
  onSearch: PropTypes.func,
  setShowAddEvent: PropTypes.any
};

function Pupil(props) {

  const [showAddEvent, setShowAddEvent] = useStateMounted(false);
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [fetchData, setFetchData] = useStateMounted<Timetable[]>([]);
  const [timetable, setTimetable] = useStateMounted<TimetableView>();
  const user = useAuth().user();
  const [date, setDate] = useStateMounted<moment.Moment>();
  const [times, setTimes] = useStateMounted<TimeByStartEnd[]>([]);
  const [days, setDays] = useStateMounted<WeekDays[]>([]);
  const [showPopup, setShowPopup] = useStateMounted<any>();
  const timetableService = new TimetableService();
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: 'Subject', limit: 20, CurrentDate: moment().format('YYYY-MM-DD') });
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const layout = useLayout();


  useEffect(() => {
    (async () => {
      setTimes(timeByStartEnd('06:00 AM', '24:00 AM', 30));
      setDate(moment());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit', 'CurrentDate']);
    // setMyLessons([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  useEffect(() => {
    const heading = <>
      <Heading
        loading={loading}
      />
    </>;
    const afterHeader = <>
      <AfterHeader
        setShowAddEvent={setShowAddEvent}
        defaultSearch={search}
        onSearch={onFilter}
      />
    </>;
    const headerRight = <>
      <Calender
        fetchData={fetchData}
      />
    </>;

    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerRight: headerRight,
      headerClass: 'timetable-header app-inner',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, fetchData]);

  useEffect(() => {
    if (date) {
      setDays(weekDays(date.format('YYYY-MM-DD'), 'YYYY-MM-DD'));
    } else {
      setDays([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => {
    if (date && days.length && times.length) {
      (async () => {
        await getTimetable({ ...search });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, days, times, search]);


  useEffect(() => {
    if (days.length && times.length && (fetchData && fetchData.length)) {
      const viewData = {
        Days: days,
        Times: times,
        TimetableData: fetchData
      };
      const timetableData = new TimetableView(viewData);
      setTimetable(timetableData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, times, fetchData]);

  const getTimetable = async (search) => {
    setLoading(true);
    setError(null);
    timetableService.get('pupil', user.UserDetialId, search)
      .then((res) => {
        setFetchData(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onClick = (type, data) => {
    setShowPopup({ type: type, data: data });
  }

  const onRefresh = () => {
    if (date && days.length && times.length) {
      (async () => {
        const search = {
          CurrentDate: date.format('YYYY-MM-DD')
        }
        await getTimetable(search);
      })();
    }
  }

  return (
    <div className="timetable-teacher">
      {
        (loading)
          ? 'Loading...'
          : null
      }
      {
        (error)
          ? error
          : null
      }
      {
        (!loading && !error && timetable === undefined)
          ?
          <div className="app-empty-screen">
            <div className="app-empty-icon">
              <Image src={ImgNoCalendat} alt="Not record found" />
            </div>
            <div className="app-empty-content">
              <h3>You have no lessons or events yet</h3>
              <p>Create a lesson or event to start</p>
            </div>
          </div>
          : <MyTimetable utype="teacher" timetable={timetable} callback={onClick} />
      }
      {
        (showPopup)
          ? (
            (showPopup.type === 'event')
              ? <EventModel event={showPopup.data} handleClose={setShowPopup} />
              : <LessonModel lesson={showPopup.data} handleClose={setShowPopup} />
          )
          : null
      }
      {(showAddEvent) ? <AddEventModel onRefresh={onRefresh} handleClose={setShowAddEvent} /> : null}
    </div>
  );
}

export default Pupil;
