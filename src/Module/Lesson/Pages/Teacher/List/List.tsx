import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Dropdown, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from "react-icons/fa";
import moment from 'moment';
import { useAuth } from '../../../../../Core/Providers/AuthProvider';
import { useLayout } from '../../../../../Core/Providers/LayoutProvider';
import { useInfiniteScroll, useStateMounted } from '../../../../../Core/Hooks';
import { Lesson, LessonService } from '../../../../../Services/LessonService';
import { BsFunnel, BsPlusLg } from 'react-icons/bs';
import { RiSearchLine } from 'react-icons/ri';
import _ from 'lodash';
import ImgNoLesson from '../../../../../Assets/Images/Svg/no-lesson.svg';
import Image from '../../../../../Components/Image';
import './List.scss';
import { DataService } from '../../../../../Core/Services';
import { DataStore } from '../../../../../Core/Services/DataService';

function Heading() {
  return <>
    <h2 className="header-title">Lesson and homework planner</h2>
  </>;
};


type AfterHeaderProps = {
  defaultSearch?: object;
  onSearch?: ((search: object) => void);
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultSearch, onSearch } = props;
  const [search, setSearch] = useStateMounted<any>();
  const [activeFilter, setActiveFilter] = useStateMounted("Date");


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
        <div className="filter-search" style={{ width: '76%' }}>
          <Form onSubmit={onSubmit}>
            <Form.Group className="filter-search-input" controlId="Searchby">
              <button type='submit' className="search-btn"><RiSearchLine /></button>
              <Form.Control
                placeholder="Search teacher..."
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
        <Link
          to={'/lesson/add'}
          state={{ returnTo: '/lesson' }}
          className='btn btn-success' type="button"><BsPlusLg /> Add Lesson</Link>
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultSearch: PropTypes.object,
  onSearch: PropTypes.func
};

function List() {

  const dataService = DataStore;
  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: 'Date', limit: 20 });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myLessons, setMyLessons] = useStateMounted<Lesson[]>([]);
  const lessonService = new LessonService();
  const user = useAuth().user();
  const layout = useLayout();

  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit']);
    setMyLessons([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  useEffect(() => {
    dataService.delete('LESSON_TMP');
    dataService.delete('HOMEWORK_TMP');
  }, []);

  useEffect(() => {
    (async () => {
      const heading = <><Heading /></>;
      const afterHeader = <>
        <AfterHeader
          defaultSearch={search}
          onSearch={onFilter}
        />
      </>;
      layout.clear().set({
        heading: heading,
        afterHeader: afterHeader,
        headerClass: 'app-inner'
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, search]);

  useEffect(() => {
    (async () => {
      await getLessons(search);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    if (!isScroll) return;
    if (!nextPage) {
      setScroll(false);
      return;
    }
    setSearch((prevSearch) => {
      return { ...prevSearch, page: nextPage };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScroll, nextPage]);

  const getLessons = async (search) => {
    setLoading(true);
    setError(null);
    await lessonService.getAll(user.id, search)
      .then((res) => {
        setMyLessons((prevLessons) => {
          return [...prevLessons, ...res.lessons];
        });
        setNextPage(res.pagination.nextPage);
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
        setScroll(false);
      });
  };

  const LoadingSkeleton = (props) => {
    return <>
      {
        [...Array(props.row)].map((j, i) => {
          return (
            <tr key={i}>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
            </tr>
          );
        })
      }
    </>
  };

  return (
    <>
      <Helmet>
        <title>Lesson</title>
      </Helmet>
      <div className="app-lesson-list teacher-lesson-list">
        <Table responsive className="list-table">
          <thead>
            <tr>
              <th></th>
              <th>Subject</th>
              <th>Lesson Topic</th>
              <th>Date</th>
              <th>Group</th>
              <th>Live Lesson</th>
              <th>Published </th>
              <th>Homework</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
            {(error) ? <tr><td colSpan={9} style={{ width: '100%' }}>{error}</td></tr> : null}
            {
              (!loading && !error && (myLessons && myLessons.length === 0))
                ? <tr><td colSpan={9} style={{ width: '100%' }}>
                  <div className="app-empty-screen">
                    <div className="app-empty-icon">
                      <Image src={ImgNoLesson} alt="Not record found" />
                    </div>
                    <div className="app-empty-content">
                      <h3>You have no lessons or homework yet</h3>
                      <p>Start planning to add new lessons or homework here</p>
                    </div>
                  </div>
                </td></tr>
                : null
            }
            {
              (!error && (myLessons && myLessons.length))
                ? (
                  myLessons.map((lesson, i) => {
                    return (
                      <tr key={i}>
                        <td><span className="color-code" style={{ backgroundColor: lesson.SubjectColor }}></span></td>
                        <td>{lesson.SubjectName}</td>
                        <td>{lesson.LessonTopic}</td>
                        <td>{moment(lesson.Date).format('DD/MM/YYYY')}</td>
                        <td>{lesson.GroupName}</td>
                        <td className={(lesson.LiveSession) ? 'yes' : 'no'}>{(lesson.LiveSession) ? 'Yes' : 'No'}</td>
                        <td className={(lesson.Publish) ? 'yes' : 'no'}>{(lesson.Publish) ? 'Yes' : 'No'}</td>
                        <td className={(lesson.homeWork) ? 'yes' : 'no'}>{(lesson.homeWork) ? 'Yes' : 'No'}</td>
                        <td>
                          <Link
                            to={"/lesson/detail/" + lesson.id}
                            state={{ returnTo: '/lesson' }}><FaAngleRight /></Link>
                        </td>
                      </tr>
                    );
                  })
                )
                : null
            }
            {(isScroll && nextPage) ? <LoadingSkeleton row={5} /> : null}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default List;
