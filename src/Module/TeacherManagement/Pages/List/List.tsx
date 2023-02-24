import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Button, Dropdown, Form, Nav, Tab, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from "react-icons/fa";
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useInfiniteScroll, useStateMounted } from '../../../../Core/Hooks';
import { Teacher, TeacherService } from '../../../../Services/TeacherService';
import { Image } from '../../../../Components';
import { BsFunnel, BsPlusLg } from 'react-icons/bs';
import { Add } from '../../Components/Popup';
import { RiSearchLine } from 'react-icons/ri';
import _ from 'lodash';
import './List.scss';

function Heading() {
  return <>
    <h2 className="header-title">Teacher Management</h2>
  </>;
};

type AfterHeaderProps = {
  defaultActiveTab: string;
  defaultSearch?: object;
  onSelectTab: (key: any) => void;
  onSearch?: (search: object) => void;
  onRefresh?: () => void;
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultActiveTab, defaultSearch, onSelectTab, onSearch, onRefresh } = props;
  const [search, setSearch] = useStateMounted<any>();
  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);
  const [showAdd, setShowAdd] = useStateMounted(false);

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

  return <>
    <div className="app-header-tab-filter">
      <div className="header-tabs">
        <Tab.Container id="teacher-tabs" onSelect={onSelect} activeKey={activeTab}>
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="teacherOverview">Teacher Overview</Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      </div>
      <div className="header-filter filter-other">
        <div className="filter-search">
          <Form onSubmit={onSubmit}>
            <Form.Group className="filter-search-input" controlId="Searchby">
              <button type='submit' className="search-btn"><RiSearchLine /></button>
              <Form.Control
                placeholder="Search teacher..."
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
        <Button onClick={(e) => setShowAdd(true)} variant="success" type="button"><BsPlusLg /> New Teacher</Button>
        {(showAdd) ? <Add handleClose={setShowAdd} onRefresh={onRefresh} /> : null}
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultActiveTab: PropTypes.string,
  defaultSearch: PropTypes.object,
  onSelectTab: PropTypes.func,
  onSearch: PropTypes.func,
  onRefresh: PropTypes.func
};

function List() {

  const defaultActiveTab = 'teacherOverview';
  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: '-1', limit: 20 });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myTeachers, setMyTeachers] = useStateMounted<Teacher[]>([]);
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const teacherService = new TeacherService();
  const user = useAuth().user();
  const layout = useLayout();

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit']);
    setMyTeachers([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  const onRefresh = () => {
    const newSearch = _.pick(search, ['Searchby', 'Filterby', 'limit']);
    setMyTeachers([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  useEffect(() => {
    const heading = <>
      <Heading />
    </>;
    const afterHeader = <>
      <AfterHeader
        defaultSearch={search}
        defaultActiveTab={defaultActiveTab}
        onSelectTab={onSelectTab}
        onSearch={onFilter}
        onRefresh={onRefresh}
      />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'app-inner',
      mainContentClass: 'app-inner',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, search, defaultActiveTab]);

  useEffect(() => {
    (async () => {
      await getTeachers(search);
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

  const getTeachers = async (search) => {
    setLoading(true);
    setError(null);
    await teacherService.getBySchoolID(user.UserDetialId, search)
      .then((res) => {
        setMyTeachers((prevTeachers) => {
          return [...prevTeachers, ...res.teachers];
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
              <td>
                <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
              </td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td>
                <div className="d-flex-center">
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                </div>
              </td>
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
        <title>Teacher Management</title>
      </Helmet>
      <div className="app-teacher-list">
        <Tab.Container id="teacher-tabs" activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="teacherOverview">
              <Table responsive className="list-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Title</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Teaching Year</th>
                    <th className="text-center">
                      Scheduled Activity
                      <span className="multiple-row">
                        <span>Lessons</span>
                        <span>Homework</span>
                      </span>
                    </th>
                    <th>Contact</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
                  {(error) ? <tr><td colSpan={8} style={{ width: '100%' }}>{error}</td></tr> : null}
                  {
                    (!loading && !error && (myTeachers && myTeachers.length === 0))
                      ? <tr><td colSpan={8} style={{ width: '100%' }}>Not record found</td></tr>
                      : null
                  }
                  {
                    (!error && (myTeachers && myTeachers.length))
                      ? (
                        myTeachers.map((teacher, i) => {
                          return (
                            <tr key={i}>
                              <td className='profile-thumb'>
                                <Image domain="server" src={teacher.ProfilePicture} alt={teacher.FullName} />
                              </td>
                              <td>{teacher.TitleName}</td>
                              <td>{teacher.FirstName}</td>
                              <td>{teacher.LastName}</td>
                              <td>{teacher.TeachingYear}</td>
                              <td>
                                <div className="d-flex-center">
                                  <span>{teacher.LessonCount}</span>
                                  <span>{teacher.HomeworkCount}</span>
                                </div>
                              </td>
                              <td>{teacher.Email}</td>
                              <td>
                                <Link
                                  to={"/teacher-management/detail/" + teacher.TeacherId}
                                  state={{ returnTo: '/teacher-management' }}><FaAngleRight /></Link>
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
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
}

export default List;
