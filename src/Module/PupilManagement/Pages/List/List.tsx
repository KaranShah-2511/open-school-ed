import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Button, Dropdown, Form, Nav, Tab, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from "react-icons/fa";
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useInfiniteScroll, useStateMounted, useVisibility } from '../../../../Core/Hooks';
import { Pupil, PupilService } from '../../../../Services/PupilService';
import { Image } from '../../../../Components';
import { BsFunnel, BsPlusLg } from 'react-icons/bs';
import { Add } from '../../Components/Popup';
import { AiOutlineStar } from 'react-icons/ai';
import { ClassSetup, GroupSetup } from '../../Components';
import moment from 'moment';
import _ from 'lodash';
import { RiSearchLine } from 'react-icons/ri';
import ImgNoPupil from '../../../../Assets/Images/Svg/no-pupil.svg';
import './List.scss';

function Heading() {
  return <>
    <h2 className="header-title">Pupil Management</h2>
  </>;
};

type AfterHeaderProps = {
  defaultActiveTab: string;
  defaultSearch?: object;
  uType: string;
  onSelectTab: (key: any) => void;
  onSearch?: (search: object) => void;
  onRefresh?: () => void;
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultActiveTab, defaultSearch, uType, onSelectTab, onSearch, onRefresh } = props;

  const [search, setSearch] = useStateMounted<any>();
  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);
  const [showAdd, setShowAdd] = useStateMounted(false);
  const [activeFilter, setActiveFilter] = useStateMounted("Name");

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
        <Tab.Container id="pupil-tabs" onSelect={onSelect} activeKey={activeTab}>
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="pupil-overview">Pupil Overview</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              {
                (uType === 'school')
                  ? <Nav.Link eventKey="class-set-up">Class Set Up</Nav.Link>
                  : null
              }
              {
                (uType === 'teacher')
                  ? <Nav.Link eventKey="group-set-up">Group Set Up</Nav.Link>
                  : null
              }
            </Nav.Item>
          </Nav>
        </Tab.Container>
      </div>
      <div className="header-filter filter-other">
        {
          (activeTab === 'pupil-overview')
            ? <>
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
                  <Dropdown.Toggle variant="outline-secondary">By {activeFilter}<BsFunnel /></Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="name" active={(search?.Filterby === "name")}>Name</Dropdown.Item>
                    <Dropdown.Item eventKey="group" active={(search?.Filterby === "group")}>Group</Dropdown.Item>
                    <Dropdown.Item eventKey="dob" active={(search?.Filterby === "dob")}>DOB</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </>
            : null
        }

        {
          (activeTab === 'pupil-overview')
            ? (uType === 'teacher')
              ? <>
                <Link to={'/pupil-management/add'} state={{ returnTo: '/pupil-management' }} className="btn btn-success" title="New Pupil">
                  <BsPlusLg /> New Pupil
                </Link>
              </>
              : <>
                <Button onClick={(e) => setShowAdd(true)} variant="success" type="button"><BsPlusLg /> New Pupil</Button>
                {(showAdd) ? <Add handleClose={setShowAdd} onRefresh={onRefresh} /> : null}
              </>
            : null
        }
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultActiveTab: PropTypes.string,
  defaultSearch: PropTypes.object,
  uType: PropTypes.string,
  onSelectTab: PropTypes.func,
  onSearch: PropTypes.func,
  onRefresh: PropTypes.func
};

function List(props) {

  const tabs = ['pupil-overview', 'class-set-up', 'group-set-up'];
  const defaultActiveTab = useParams().tab || 'pupil-overview';
  const [visiblEleRef, isVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: 'name', limit: 20 });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myPupils, setMyPupils] = useStateMounted<Pupil[]>([]);
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const pupilService = new PupilService();
  const user = useAuth().user();
  const layout = useLayout();

  useEffect(() => {
    if (defaultActiveTab && tabs.includes(defaultActiveTab)) {
      onSelectTab(defaultActiveTab);
    } else {
      onSelectTab('pupil-overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveTab]);

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'limit']);
    setMyPupils([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  const onRefresh = () => {
    const newSearch = _.pick(search, ['Searchby', 'Filterby', 'limit']);
    setMyPupils([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  useEffect(() => {
    const heading = <>
      <Heading />
    </>;
    const afterHeader = <>
      <AfterHeader
        defaultActiveTab={defaultActiveTab}
        uType={user.userType.Type}
        defaultSearch={search}
        onSelectTab={onSelectTab}
        onSearch={onFilter}
        onRefresh={onRefresh}
      />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'app-inner',
      mainContentClass: (activeTab !== 'pupil-overview') ? '' : 'app-inner',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, search, defaultActiveTab, activeTab]);

  useEffect(() => {
    (async () => {
      await getPupils(search);
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

  const getPupils = async (search) => {
    setLoading(true);
    setError(null);
    let callback;
    if (user.userType.Type === 'school') {
      callback = pupilService.getBySchoolID(user.UserDetialId, search);
    } else {
      callback = pupilService.getByTeacherID(user.id, search);
    }
    await callback
      .then((res) => {
        setMyPupils((prevPupils) => {
          return [...prevPupils, ...res.pupiles];
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
              <td className="text-center"><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td>
                <div className="d-flex-center">
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                </div>
              </td>
              <td>
                <div className="d-flex-center">
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                </div>
              </td>
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
        <title>Pupil Management</title>
      </Helmet>
      <div className="app-pupil-list">
        <Tab.Container id="pupil-tabs" activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="pupil-overview">
              <Table responsive className="list-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Class Group</th>
                    <th className="text-center">D.O.B</th>
                    <th className="text-center">
                      Performance
                      <span className="multiple-row">
                        <span>Engagement</span>
                        <span>Effort</span>
                      </span>
                    </th>
                    <th className="text-center">
                      Quick Reward
                      <span className="multiple-row">
                        <span>Bronze</span>
                        <span>Silver</span>
                        <span>Gold</span>
                      </span>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
                  {(error) ? <tr><td colSpan={8} style={{ width: '100%' }}>{error}</td></tr> : null}
                  {
                    (!loading && !error && (myPupils && myPupils.length === 0))
                      ? <tr><td colSpan={8} style={{ width: '100%' }}>
                        <div className="app-empty-screen">
                          <div className="app-empty-icon">
                            <Image src={ImgNoPupil} alt="Not record found" />
                          </div>
                          <div className="app-empty-content">
                            <h3>There doesn’t seem to be any pupils here</h3>
                            <p>Start adding pupils to invite them to join the school</p>
                          </div>
                        </div>
                      </td></tr>
                      : null
                  }
                  {
                    (!error && (myPupils && myPupils.length))
                      ? (
                        myPupils.map((pupil, i) => {
                          return (
                            <tr key={i}>
                              <td className='profile-thumb'>
                                <Image domain="server" src={pupil.ProfilePicture} alt={pupil.FullName} />
                              </td>
                              <td>{pupil.FirstName}</td>
                              <td>{pupil.LastName}</td>
                              <td>{pupil.GroupName.join(', ')}</td>
                              <td className="text-center">{moment(pupil.Dob).format('DD/MM/YYYY')}</td>
                              <td>
                                <div className="perfomance">
                                  <span className="engagement"></span>
                                  <span className="effort"></span>
                                </div>
                              </td>
                              <td>
                                <div className="reward">
                                  <span className="bronze"><AiOutlineStar /><span className='count'>{pupil.getReward('bronze')}</span></span>
                                  <span className="silver"><AiOutlineStar /><span className='count'>{pupil.getReward('silver')}</span></span>
                                  <span className="gold"><AiOutlineStar /><span className='count'>{pupil.getReward('gold')}</span></span>
                                </div>
                              </td>
                              <td>
                                <Link
                                  to={"/pupil-management/detail/" + pupil.id}
                                  state={{ returnTo: '/pupil-management' }}><FaAngleRight /></Link>
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
            {
              (user.userType.Type === 'school')
                ? <>
                  <Tab.Pane eventKey="class-set-up">
                    <div ref={visiblEleRef}>
                      {
                        (isVisible)
                          ? <ClassSetup />
                          : null
                      }
                    </div>
                  </Tab.Pane>
                </>
                : null
            }
            {
              (user.userType.Type === 'teacher')
                ? <>
                  <Tab.Pane eventKey="group-set-up">
                    <div ref={visiblEleRef}>
                      {
                        (isVisible)
                          ? <GroupSetup />
                          : null
                      }
                    </div>
                  </Tab.Pane>
                </>
                : null
            }
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
}

export default List;
function active(arg0: string, active: any): React.ReactNode {
  throw new Error('Function not implemented.');
}

