import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { useLayout } from '../../../../../Core/Providers/LayoutProvider';
import { IoMdArrowBack } from "react-icons/io";
import { Link, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { Button, Dropdown, Form, Nav, Spinner, Tab } from 'react-bootstrap';
import { useStateMounted, useVisibility } from '../../../../../Core/Hooks';
import { Lesson, LessonService } from '../../../../../Services/LessonService';
import { Plan, Homework, SubmittedList } from '../../../Components/Tabs';
import { RiSearchLine } from 'react-icons/ri';
import { BsFunnel } from 'react-icons/bs';
import _ from 'lodash';
import './Detail.scss';
import { DataStore } from '../../../../../Core/Services/DataService';

type HeadingProps = {
  loading: boolean;
  lesson: Lesson | undefined;
  error: string | null;
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const { loading, lesson, error, returnTo } = props;

  if (!loading && lesson) {
    return <>
      <Helmet>
        <title>
          {lesson.SubjectName} - {moment(lesson.Date).format('DD/MM/YYYY')}
        </title>
      </Helmet>
      <h2 className="header-title">
        {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
        {lesson.SubjectName} - {moment(lesson.Date).format('DD/MM/YYYY')}
      </h2>
    </>;
  }

  return <>
    <Helmet>
      <title>
        {
          (error)
            ? 'Error'
            : 'Loading...'
        }
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
      {
        (error)
          ? 'Error'
          : (
            <>
              <Skeleton containerClassName="skeleton" width={200} inline={true} />
            </>
          )
      }
    </h2>
  </>;
};

Heading.propTypes = {
  loading: PropTypes.bool,
  lesson: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string
};

type AfterHeaderProps = {
  utype: string;
  defaultActiveTab: string;
  defaultSearch?: object;
  loading: boolean;
  lesson: Lesson | undefined;
  error: string | null;
  returnTo?: any;
  frmHomeworkSubmitting: boolean;
  onSubmitHomework: () => void;
  onSelectTab: (key: any) => void;
  onSearch?: (search: object) => void;
  onRefresh?: () => void;
}

function AfterHeader(props: AfterHeaderProps) {

  const {
    utype, defaultActiveTab, defaultSearch, onSelectTab, onSearch,
    loading, lesson, error, frmHomeworkSubmitting, onSubmitHomework
  } = props;

  const [search, setSearch] = useStateMounted<any>();
  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);

  const onSelect = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

  const onSearchCall = (sparam) => {
    if (onSearch !== undefined) {
      onSearch(sparam);
    }
  }

  const onFilterBy = async (key) => {
    if (search?.Filterby !== key) {
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
    if (onSelectTab !== undefined) {
      onSelectTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    setSearch(defaultSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearch]);

  if (!loading && lesson) {
    return (
      <>
        <div className="app-header-tab-filter">
          <div className="header-tabs">
            <Tab.Container id="lesson-detail-tabs" onSelect={onSelect} activeKey={activeTab}>
              <Nav variant="pills">
                <Nav.Item>
                  <Nav.Link eventKey="lessonPlan">Lesson Plan</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="lessonHomework">Lesson Homework</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="homeworkSubmitted">Homework Submitted</Nav.Link>
                </Nav.Item>
              </Nav>
            </Tab.Container>
          </div>
          {
            (['lessonPlan', 'lessonHomework'].includes(activeTab) && utype === 'teacher')
              ? <>
                <div className="header-filter filter-other edit-lesson">
                  {
                    (activeTab === 'lessonPlan')
                      ? <>
                        <Link
                          to={'/lesson/edit/' + lesson.id}
                          state={{ returnTo: '/lesson/detail/' + lesson.id }}
                          className="btn btn-success" type="button">Edit Lesson</Link>
                      </>
                      : <>
                        <Button variant='success' type="button"
                          onClick={() => onSubmitHomework()}>
                          Set Homework
                          {(frmHomeworkSubmitting) ? <Spinner className="spinner ml-1" animation="border" size="sm" /> : null}
                        </Button>
                      </>
                  }

                </div>
              </>
              : null
          }
          {
            (activeTab === 'homeworkSubmitted')
              ? <>
                <div className="header-filter filter-other">
                  <div className="filter-search">
                    <Form onSubmit={onSubmit}>
                      <Form.Group className="filter-search-input" controlId="Searchby">
                        <button type='submit' className="search-btn"><RiSearchLine /></button>
                        <Form.Control
                          placeholder="Search pupil..."
                          type="text"
                          name="Searchby"
                          onChange={changeSearchby}
                          value={search?.Searchby || ''}
                          style={{ width: '545px' }}
                        />
                      </Form.Group>
                    </Form>
                  </div>
                  <div className="filter-by">
                    <Dropdown className="filter-dropdown" onSelect={onFilterBy}>
                      <Dropdown.Toggle variant="outline-secondary">By Name<BsFunnel /></Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="1" active={(search?.Filterby === "1")}>Ascending Name</Dropdown.Item>
                        <Dropdown.Item eventKey="-1" active={(search?.Filterby === "-1")}>Descending Name</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </>
              : null
          }
        </div>
      </>
    );
  }

  return (
    <>
      {
        (!error)
          ? (
            <div className="header-tabs">
              <Tab.Container>
                <Nav>
                  <Nav.Item>
                    <Nav.Link><Skeleton containerClassName="skeleton" width={150} inline={true} /></Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link><Skeleton containerClassName="skeleton" width={150} inline={true} /></Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link><Skeleton containerClassName="skeleton" width={150} inline={true} /></Nav.Link>
                  </Nav.Item>
                </Nav>
              </Tab.Container>
              <div className="edit-lesson">
                <Skeleton containerClassName="skeleton" width={150} inline={true} />
              </div>
            </div>
          )
          : null
      }
    </>
  );
};

AfterHeader.propTypes = {
  utype: PropTypes.string,
  defaultActiveTab: PropTypes.string,
  defaultSearch: PropTypes.object,
  loading: PropTypes.bool,
  lesson: PropTypes.object,
  error: PropTypes.string,
  onSelectTab: PropTypes.func,
  onSearch: PropTypes.func,
  onRefresh: PropTypes.func,
  onSubmitHomework: PropTypes.func,
  frmHomeworkSubmitting: PropTypes.bool
};

function Detail(props) {

  const dataService = DataStore;
  const { uType } = props;
  const location = useLocation();
  const defaultActiveTab = new URLSearchParams(location.search).get('tabs') || 'lessonPlan';
  const lessonID: any = useParams().id;
  const [homeworkEleRef, isHomework] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [submittedListEleRef, isSubmittedList] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [lesson, setLesson] = useStateMounted<Lesson>();
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: '-1', limit: 20 });
  const frmHomeworkRef = useRef<HTMLFormElement>(null);
  const [frmHomeworkSubmitting, setFrmHomeworkSubmitting] = useStateMounted<boolean>(false);
  const lessonService = new LessonService();
  const layout = useLayout();

  const onFrmSubmitHomework = () => {
    if (frmHomeworkRef.current) {
      if (typeof frmHomeworkRef.current.requestSubmit === 'function') {
        frmHomeworkRef.current.requestSubmit();
      } else {
        frmHomeworkRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
  };

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit']);
    setSearch(newSearch);
  }

  const onRefresh = () => {
    const newSearch = _.pick(search, ['Searchby', 'Filterby', 'limit']);
    setSearch(newSearch);
  }

  useEffect(() => {
    (async () => {
      dataService.delete('LESSON_TMP');
      await getLesson();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonID]);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        lesson={lesson}
        returnTo={returnTo}
      />
    </>;
    const afterHeader = <>
      <AfterHeader
        utype={uType}
        defaultActiveTab={defaultActiveTab}
        error={error}
        loading={loading}
        lesson={lesson}
        returnTo={returnTo}
        defaultSearch={search}
        onSelectTab={onSelectTab}
        onSearch={onFilter}
        onRefresh={onRefresh}
        onSubmitHomework={onFrmSubmitHomework}
        frmHomeworkSubmitting={frmHomeworkSubmitting}
      />
    </>;

    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'app-inner',
      mainContentClass: (activeTab === 'homeworkSubmitted') ? 'app-inner' : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, loading, search, lesson, error, returnTo, defaultActiveTab, activeTab, frmHomeworkSubmitting, uType]);

  const getLesson = async () => {
    setLoading(true);
    setError(null);
    await lessonService.get(lessonID)
      .then((res) => {
        if (res.id) {
          setLesson(res);
        } else {
          setError('Not record found!');
        }
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

  return (
    <div className="app-lesson-detail teacher-lesson-detail">
      {
        (loading)
          ? 'Loading'
          : null
      }
      {
        (error)
          ? error
          : null
      }
      {
        (!loading && !error && !lesson)
          ? 'Not record found!'
          : null
      }
      {
        (!loading && !error && lesson)
          ? (
            <Tab.Container id="lesson-detail-tabs" activeKey={activeTab}>
              <Tab.Content>
                <Tab.Pane eventKey="lessonPlan">
                  <Plan utype='teacher' lesson={lesson} />
                </Tab.Pane>
                <Tab.Pane eventKey="lessonHomework">
                  <div ref={homeworkEleRef}>
                    {
                      (isHomework)
                        ? <Homework
                          utype={props.uType}
                          lesson={lesson}
                          formRef={frmHomeworkRef}
                          isSubmit={setFrmHomeworkSubmitting}
                        />
                        : null
                    }
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="homeworkSubmitted">
                  <div ref={submittedListEleRef}>
                    {
                      (isSubmittedList)
                        ? <SubmittedList
                          searchList={search}
                          utype={props.uType}
                          lesson={lesson} />
                        : null
                    }
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          ) : null
      }
    </div>
  );
}

export default Detail;
