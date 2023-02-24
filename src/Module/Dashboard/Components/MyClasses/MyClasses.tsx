import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Nav, Row, Tab, Spinner } from 'react-bootstrap';
import Scrollbars from 'react-custom-scrollbars';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import Image from '../../../../Components/Image';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useStateMounted, useDownload } from '../../../../Core/Hooks';
import { MyClass, MyClassService } from '../../../../Services/MyClassService';
import Skeleton from 'react-loading-skeleton';
import ImgNoMyClass from '../../../../Assets/Images/Svg/no-myday.svg';
import { GetUrl } from '../../../../Core/Utility/Function';
import './MyClasses.scss';

type MyClassesProps = {
  utype: string;
}

type ContentLinkProps = {
  myClasses: MyClass[];
  activeTab: number;
  utype: string;
}

function Links(props: ContentLinkProps) {

  const { myClasses } = props;

  return (
    <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          {
            myClasses.map((myClass, i) => {
              return (
                <Nav.Link key={i} eventKey={i}>
                  <div className="tabLink">
                    <div className="tabSub">
                      <div className="subLine" style={{ backgroundColor: myClass.SubjectColor }}></div>
                      <div className="sub">
                        <span>{myClass.SubjectName}</span>{myClass.LessonTopic}
                      </div>
                    </div>
                    <div className="tabSub time">
                      <div className="group"><span>{myClass.GroupName}</span></div>
                      <time>{myClass.StartTime} - {myClass.EndTime}</time>
                    </div>
                  </div>
                </Nav.Link>
              );
            })
          }
        </Nav.Item>
      </Nav>
    </Scrollbars>
  );

}

Links.propTypes = {
  myClasses: PropTypes.array,
  activeTab: PropTypes.any,
  utype: PropTypes.string
};

function Content(props: ContentLinkProps) {

  const { myClasses, activeTab } = props;
  const myClass = (myClasses && myClasses[activeTab]) ? myClasses[activeTab] : '';
  const [dLoading, download, dFile] = useDownload();

  return (
    <Tab.Content>
      <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
        {
          (myClass)
            ? (
              <div className="content-inner">
                <div className="title-bar">
                  <h2>{myClass.LessonTopic}</h2>
                  <div className="date-time-group">
                    <div className="date common-dtg">
                      <Image src="/assets/images/svg/calendar-small-icon.svg" alt="Date" />
                      <span>{moment(myClass.Date).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="time common-dtg">
                      <Image src="/assets/images/svg/clock.svg" alt="Time" />
                      <span>{myClass.StartTime} - {myClass.EndTime}</span>
                    </div>
                    <div className="group common-dtg">
                      <Image src="/assets/images/svg/group.svg" alt="Group" />
                      <span>{myClass.GroupName}</span>
                    </div>
                  </div>
                </div>
                {
                  (myClass.allPupilList.length)
                    ?
                    <div className="users-bar">
                      {
                        myClass.allPupilList.slice(0, 17).map((pupil, i) => {
                          return (
                            <Link to="#" key={i}>
                              <Image domain="server" src={pupil.ProfilePicture} alt={pupil.PupilName} title={pupil.PupilName} />
                            </Link>
                          );
                        })
                      }
                      {
                        (myClass.allPupilList.length > 17)
                          ? <Link to="#">
                            <span>+{myClass.allPupilList.length - 7}</span>
                          </Link>
                          : null
                      }
                    </div>
                    : null
                }
                <div className="content">
                  <p>{myClass.LessonDescription}</p>
                  {
                    (myClass.MaterialList.length)
                      ? <>
                        <div>
                          <h4>Attachment(s)</h4>
                          <div className="attachment-area">
                            <ul>
                              {
                                myClass.MaterialList.map((material, i) => {
                                  const dObj = { url: GetUrl(material.filename, 'server'), filename: material.originalname }
                                  return (
                                    <li key={i}>
                                      <p>{material.originalname}</p>
                                      <a href="#" onClick={() => download(dObj)} >
                                        {(dLoading && (dFile && dFile.url === dObj.url))
                                          ? <Spinner animation='border' variant="primary" size="sm" />
                                          : <Image src="/assets/images/svg/download.svg" alt="Download File" />
                                        }
                                      </a>
                                    </li>
                                  );
                                })
                              }
                            </ul>
                          </div>
                        </div>
                      </>
                      : null
                  }
                </div>
                {
                  (myClass.CheckList && myClass.CheckList.length)
                    ?
                    <div className="check-list">
                      <h4>Items that your class will need</h4>
                      <ul>
                        {
                          myClass.CheckList.map((check, i) => {
                            return (
                              <li key={i}>{check.ItemName}</li>
                            );
                          })
                        }
                      </ul>
                    </div>
                    : null
                }
                <div className="btn-area text-right mt-50">
                  <Link to={`/lesson/edit/${myClass.id}`}>
                    <Button variant="outline-dark" type="button" >
                      Edit Class
                    </Button>
                  </Link>
                  <Button variant="success" className="ml-1" type="submit">Start Class</Button>
                </div>
              </div>
            )
            : null
        }
      </Scrollbars>
    </Tab.Content>
  );

}

Content.propTypes = {
  myClasses: PropTypes.array,
  activeTab: PropTypes.any,
  utype: PropTypes.string
};

function LoadingSkeleton() {

  return (
    <Tab.Container id="classes-tabs" defaultActiveKey="0">
      <Row>
        <Col className="p-0 tab-nav-area" lg={4}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              {
                [...Array(6)].map((j, i) => {
                  return (
                    <Nav.Link key={i} eventKey={i}>
                      <div className="tabLink">
                        <div className="tabSub">
                          <div className="subLine">
                            <Skeleton containerClassName="skeleton" inline={true} width="100%" height="100%" />
                          </div>
                          <div className="sub">
                            <span style={{ marginBottom: '5px' }}><Skeleton containerClassName="skeleton" inline={true} width="100px" height="18px" /></span>
                            <Skeleton containerClassName="skeleton" inline={true} width="200px" height="22px" />
                          </div>
                        </div>
                        <div className="tabSub time">
                          <div className="group">
                            <span><Skeleton containerClassName="skeleton" inline={true} width="56px" /></span>
                          </div>
                          <time>
                            <Skeleton containerClassName="skeleton" inline={true} width="55px" height="18px" /> - <Skeleton containerClassName="skeleton" inline={true} width="55px" height="18px" />
                          </time>
                        </div>
                      </div>
                    </Nav.Link>
                  );
                })
              }
            </Nav.Item>
          </Nav>
        </Col>
        <Col className="p-0 tab-content-area" lg={8}>
          <Tab.Content>
            <div className="content-inner">
              <div className="title-bar">
                <h2><Skeleton containerClassName="skeleton" inline={true} width="200px" height="35px" /></h2>
                <div className="date-time-group">
                  {
                    [...Array(3)].map((j, i) => {
                      return (
                        <div className="common-dtg" key={i}>
                          <Skeleton containerClassName="skeleton" inline={true} width="16px" height="16px" />
                          <span><Skeleton containerClassName="skeleton" inline={true} width="86px" height="16px" /></span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              <div className="users-bar">
                {
                  [...Array(5)].map((j, i) => {
                    return (
                      <Link to="#" key={i}>
                        <Skeleton containerClassName="skeleton" inline={true} width="40px" height="40px" />
                      </Link>
                    );
                  })
                }
              </div>
              <div className="content">
                <p>
                  <Skeleton style={{ marginBottom: '5px' }} containerClassName="skeleton" inline={true} width="100%" height="18px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="60%" height="18px" />
                </p>
                <div className="attachment-area">
                  <Link to="#" className="attachment">
                    <Skeleton containerClassName="skeleton" inline={true} width="125px" height="22px" />
                  </Link>
                  <Link to="#" className="see-more">
                    <Skeleton containerClassName="skeleton" inline={true} width="66px" height="22px" />
                  </Link>
                </div>
              </div>
              <div className="check-list">
                <h4><Skeleton containerClassName="skeleton" inline={true} width="250px" height="21px" /></h4>
                <Skeleton containerClassName="skeleton" width="450px" height="18px" count={4} />
              </div>
            </div>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );

}

function MyClasses(props: MyClassesProps) {

  const { utype } = props;
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myClasses, setMyClasses] = useStateMounted<MyClass[]>([]);
  const [activeTab, setActiveTab] = useStateMounted<number>(0);
  const myClassService = new MyClassService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getMyClasses();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  const getMyClasses = async () => {
    setLoading(true);
    setError(null);
    const search = { CurrentDate: moment().format('YYYY-MM-DD') };
    const fetch = (utype === 'teacher')
      ? myClassService.getByTeacherID(user.id, search)
      : myClassService.getByPupilID(user.UserDetialId, search);
    await fetch
      .then((res) => {
        setMyClasses(res);
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

  const onSelectTab = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

  return (
    (utype)
      ? <>
        <div className={'app-my-classes ' + utype + '-classes'}>
          <div className="panel">
            <div className="panel-header">
              <div className="header-inner">
                <Image src="/assets/images/svg/class-icon.svg" alt="My Classes" className="icon" />
                <h2>My Classes</h2>
              </div>
              <div className="header-inner">
                <div className="calender">{moment().format('DD')}<span>{moment().format('MMM')}</span></div>
                <Link to="#" className="more-action" title="More Classes">
                  <Image src="/assets/images/svg/more-v-white.svg" alt="More Classes" />
                </Link>
              </div>
            </div>
            <div className="panel-body">
              {
                (loading || error || myClasses.length)
                  ? <>
                    {
                      (loading)
                        ? <LoadingSkeleton />
                        : null
                    }
                    {
                      (error)
                        ? <div className='m-3 text-danger'>{error}</div>
                        : null
                    }
                    {
                      (!loading && !error && (myClasses && myClasses.length))
                        ? <>
                          <Tab.Container id="classes-tabs" onSelect={onSelectTab} defaultActiveKey="0">
                            <Row>
                              <Col className="p-0 tab-nav-area" lg={4}>
                                <Links myClasses={myClasses} activeTab={activeTab} utype={utype} />
                              </Col>
                              <Col className="p-0 tab-content-area" lg={8}>
                                <Content myClasses={myClasses} activeTab={activeTab} utype={utype} />
                              </Col>
                            </Row>
                          </Tab.Container>
                        </>
                        : null
                    }
                  </>
                  : null
              }
              {
                (!myClasses.length && (!loading && !error))
                  ? <>
                    <div className="app-empty-screen">
                      <div className="app-empty-icon">
                        <Image src={ImgNoMyClass} alt="No Class Empty" />
                      </div>
                      <div className="app-empty-content">
                        <h3>No lessons or events today</h3>
                        <p>Take it easy and enjoy a break</p>
                      </div>
                    </div>
                  </>
                  : null
              }
            </div>
          </div>
        </div>
      </>
      : null
  );
}

MyClasses.propTypes = {
  utype: PropTypes.string.isRequired
};

export default MyClasses;
