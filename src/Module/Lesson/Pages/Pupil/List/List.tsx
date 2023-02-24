import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { Dropdown, Form, Nav, Tab } from 'react-bootstrap';
import { useLayout } from '../../../../../Core/Providers/LayoutProvider';
import { useStateMounted, useVisibility } from '../../../../../Core/Hooks';
import { RiSearchLine } from 'react-icons/ri';
import { BsFunnel } from 'react-icons/bs';
import _ from 'lodash';
import { HomeworkList, LessonList } from '../../../Components';
import './List.scss';

function Heading() {
  return <>
    <h2 className="header-title">Lesson and Homework</h2>
  </>;
};

type AfterHeaderProps = {
  defaultActiveTab: string;
  defaultLessonSearch?: object;
  defaultHomeworkSearch?: object;
  onSearch?: (search: object, type: string) => void;
  onSelectTab: (key: any) => void;
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultActiveTab, defaultLessonSearch, defaultHomeworkSearch, onSearch, onSelectTab } = props;

  const [searchLesson, setSearchLesson] = useStateMounted<any>();
  const [searchHomework, setSearchHomework] = useStateMounted<any>();
  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);
  const [activeFilter, setActiveFilter] = useStateMounted("Date");

  const onSelect = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

  useEffect(() => {
    if (onSelectTab !== undefined) {
      onSelectTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onSearchCall = (sparam, type) => {
    if (onSearch !== undefined) {
      onSearch(sparam, type);
    }
  }

  const onFilterBy = async (key, type) => {
    const search = (type === 'lesson') ? searchLesson : searchHomework;
    if (search?.Filterby !== key) {
      setActiveFilter(key.charAt(0).toUpperCase() + key.slice(1));
      const setSearch = (type === 'lesson') ? setSearchLesson : setSearchHomework;
      setSearch((prevSearch) => {
        const data = { ...prevSearch, Filterby: key };
        onSearchCall(data, type);
        return data
      });
    }
  }

  const changeSearchby = (e, type) => {
    const search = (type === 'lesson') ? searchLesson : searchHomework;
    if (search?.Searchby !== e.target.value.trim()) {
      const setSearch = (type === 'lesson') ? setSearchLesson : setSearchHomework;
      setSearch((prevSearch) => {
        return { ...prevSearch, Searchby: e.target.value.trim() };
      });
    }
  }

  const onSubmit = (e, type) => {
    e.preventDefault();
    const search = (type === 'lesson') ? searchLesson : searchHomework;
    onSearchCall(search, type);
  }

  useEffect(() => {
    setSearchLesson(defaultLessonSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLessonSearch]);

  useEffect(() => {
    setSearchHomework(defaultHomeworkSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultHomeworkSearch]);

  return <>
    <div className="app-header-tab-filter">
      <div className="header-tabs">
        <Tab.Container id="pupil-tabs" onSelect={onSelect} activeKey={activeTab}>
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="lessons">Lessons</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="homeworks">homeworks</Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      </div>
      {
        (activeTab === 'lessons')
          ?
          <>
            <div className="header-filter filter-other">
              <div className="filter-search">
                <Form onSubmit={(e) => onSubmit(e, 'lesson')}>
                  <Form.Group className="filter-search-input" controlId="Searchby">
                    <button type='submit' className="search-btn"><RiSearchLine /></button>
                    <Form.Control
                      placeholder="Search lesson..."
                      type="text"
                      name="Searchby"
                      onChange={(e) => changeSearchby(e, 'lesson')}
                      value={searchLesson?.Searchby || ''}
                      style={{ width: '545px' }}
                    />
                  </Form.Group>
                </Form>
              </div>
              <div className="filter-by">
                <Dropdown className="filter-dropdown" onSelect={(e) => onFilterBy(e, 'lesson')}>
                  <Dropdown.Toggle variant="outline-secondary">By {activeFilter}<BsFunnel /></Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="Subject" active={(searchLesson?.Filterby === "Subject")}>Subject</Dropdown.Item>
                    <Dropdown.Item eventKey="Date" active={(searchLesson?.Filterby === "Date")}>Date</Dropdown.Item>
                    <Dropdown.Item eventKey="Live Lesson" active={(searchLesson?.Filterby === "Live Lesson")}>Live Lesson</Dropdown.Item>
                    <Dropdown.Item eventKey="Publish Lesson" active={(searchLesson?.Filterby === "Publish Lesson")}>Publish Lesson</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </>
          : <>
            <div className="header-filter filter-other">
              <div className="filter-search">
                <Form onSubmit={(e) => onSubmit(e, 'homework')}>
                  <Form.Group className="filter-search-input" controlId="Searchby">
                    <button type='submit' className="search-btn"><RiSearchLine /></button>
                    <Form.Control
                      placeholder="Search homework..."
                      type="text"
                      name="Searchby"
                      onChange={(e) => changeSearchby(e, 'homework')}
                      value={searchHomework?.Searchby || ''}
                      style={{ width: '545px' }}
                    />
                  </Form.Group>
                </Form>
              </div>
              <div className="filter-by">
                <Dropdown className="filter-dropdown" onSelect={(e) => onFilterBy(e, 'homework')}>
                  <Dropdown.Toggle variant="outline-secondary">By {activeFilter}<BsFunnel /></Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="Subject" active={(searchHomework?.Filterby === "Subject")}>Subject</Dropdown.Item>
                    <Dropdown.Item eventKey="Date" active={(searchHomework?.Filterby === "Date")}>Date</Dropdown.Item>
                    <Dropdown.Item eventKey="Live Lesson" active={(searchHomework?.Filterby === "Live Lesson")}>Live Lesson</Dropdown.Item>
                    <Dropdown.Item eventKey="Publish Lesson" active={(searchHomework?.Filterby === "Publish Lesson")}>Publish Lesson</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </>

      }
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultSearch: PropTypes.object,
  defaultLessonSearch: PropTypes.object,
  defaultHomeworkSearch: PropTypes.object,
  onSelectTab: PropTypes.func,
  onSearch: PropTypes.func
};

function List() {

  const defaultActiveTab = 'lessons';
  const [visibleLessonEleRef, isLessonVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [visibleHomeworkEleRef, isHomeworkVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const [searchLesson, setSearchLesson] = useStateMounted<object>({ Searchby: '', Filterby: 'Date', limit: 20 });
  const [searchHomework, setSearchHomework] = useStateMounted<object>({ Searchby: '', Filterby: 'Date', limit: 20 });
  const layout = useLayout();

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  const onFilter = (sparam, type) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit']);
    const setSearch = (type === 'lesson') ? setSearchLesson : setSearchHomework;
    setSearch(newSearch);
  }

  useEffect(() => {
    (async () => {
      const heading = <><Heading /></>;
      const afterHeader = <>
        <AfterHeader
          defaultActiveTab={defaultActiveTab}
          onSelectTab={onSelectTab}
          onSearch={onFilter}
          defaultLessonSearch={searchLesson}
          defaultHomeworkSearch={searchHomework}
        />
      </>;
      layout.clear().set({
        heading: heading,
        afterHeader: afterHeader,
        headerClass: 'app-inner',
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, defaultActiveTab, activeTab, searchLesson, searchHomework]);
  useEffect(() => {
    if (!loading) { setLoading(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <>
      <Helmet>
        <title>Lesson and Homework</title>
      </Helmet>
      <div className="pupil-lesson-homework">
        <Tab.Container id="pupil-tabs" activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="lessons">
              <div ref={visibleLessonEleRef}>
                {
                  (isLessonVisible)
                    ? <>
                      <LessonList searchList={searchLesson} />
                    </>
                    : null
                }
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey="homeworks">
              <div ref={visibleHomeworkEleRef}>
                {
                  (isHomeworkVisible)
                    ? <>
                      <HomeworkList searchList={searchHomework} />
                    </>
                    : null
                }
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
}

export default List;
