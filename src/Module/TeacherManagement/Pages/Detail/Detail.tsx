import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Col, Container, Form, Nav, Row, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted, useVisibility } from '../../../../Core/Hooks';
import { Teacher, TeacherService } from '../../../../Services/TeacherService';
import { IoMdArrowBack } from 'react-icons/io';
import CountUp from 'react-countup';
import { BsCheckLg, BsXLg } from 'react-icons/bs';
import { LessonList } from '../../Components';
import Chat from '../../../../Components/Chat';
import { useAuth } from '../../../../Core/Providers';
import Image from '../../../../Components/Image';
import ImgNoTeacher from '../../../../Assets/Images/Svg/no-teacher.svg';
import './Detail.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  teacher: Teacher | undefined;
  error: string | null;
  returnTo: string;
}

function Heading(props: HeadingProps) {

  const { loading, teacher, error, returnTo } = props;

  if (!loading && teacher) {
    return <>
      <h2 className="header-title">
        <Link to={returnTo}><IoMdArrowBack /></Link>
        <Helmet>
          <title>
            {teacher.FullName}
          </title>
        </Helmet>
        {teacher.FullName}
      </h2>
    </>;
  }

  return <>
    <h2 className="header-title">
      <Link to={returnTo}><IoMdArrowBack /></Link>
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
  utype: PropTypes.string,
  loading: PropTypes.bool,
  teacher: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string
};

type AfterHeaderProps = {
  utype?: string;
  loading: boolean;
  teacher: Teacher | undefined;
  error: string | null;
  returnTo: string;
  defaultActiveTab: string;
  onSelectTab: ((key: any) => void);
}

function AfterHeader(props: AfterHeaderProps) {

  const { loading, teacher, error, defaultActiveTab, onSelectTab } = props;

  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);

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

  if (!loading && teacher) {
    return <>
      <div className="app-header-tab-filter">
        <div className="header-tabs">
          <Tab.Container id="teacher-tabs" onSelect={onSelect} activeKey={activeTab}>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="teacherProfile">Teacher Profile</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="teacher-chat">Chat</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="teacherLessonHomework">Lessons & Homework</Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </div>
      </div>
    </>;
  }

  return <>
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
                  <Nav.Link><Skeleton containerClassName="skeleton" width={100} inline={true} /></Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link><Skeleton containerClassName="skeleton" width={150} inline={true} /></Nav.Link>
                </Nav.Item>
              </Nav>
            </Tab.Container>
          </div>
        )
        : null
    }
  </>;
};

AfterHeader.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  teacher: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
  defaultActiveTab: PropTypes.string,
  onSelectTab: PropTypes.func
};

function Detail() {

  const defaultActiveTab = 'teacherProfile';
  const [visiblEleRef, isVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const teacherID: any = useParams().id;
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [teacher, setTeacher] = useStateMounted<Teacher>();
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const teacherService = new TeacherService();
  const user = useAuth().user();
  const layout = useLayout();

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  useEffect(() => {
    (async () => {
      await getTeacher();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherID]);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        teacher={teacher}
        returnTo={returnTo}
      />
    </>;
    const afterHeader = <>
      <AfterHeader
        error={error}
        loading={loading}
        teacher={teacher}
        defaultActiveTab={defaultActiveTab}
        returnTo={returnTo}
        onSelectTab={onSelectTab}
      />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'teacher-detail-header',
      mainContentClass: (teacher) ? 'teacher-detail-main' : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, teacher, error, returnTo, defaultActiveTab]);


  const getTeacher = async () => {
    setLoading(true);
    setError(null);
    await teacherService.get(teacherID)
      .then((res) => {
        setTeacher(res);
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
    <div className="app-teacher-detail">
      <Tab.Container id="teacher-detail-tabs" activeKey={activeTab}>
        <Tab.Content>
          <Tab.Pane eventKey="teacherProfile">
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
              (!loading && !error && !teacher)
                ?
                <div className="app-empty-screen">
                  <div className="app-empty-icon">
                    <Image src={ImgNoTeacher} alt="Not record found" />
                  </div>
                  <div className="app-empty-content">
                    <h3>There doesn’t seem to be any teachers here</h3>
                    <p>Start adding teachers to invite them to join the school</p>
                  </div>
                </div>
                : null
            }
            {
              (!loading && !error && teacher)
                ? (
                  <div className='teacher-profile-view'>
                    <div className="profile-banner">
                      <div className="profile-pic">
                        <Image domain="server" src={teacher.ProfilePicture} alt={teacher.FullName} />
                      </div>
                      <div className="edit-profile">
                        <Link
                          to={'/teacher-management/edit/' + teacher.TeacherId}
                          state={{ returnTo: '/teacher-management/detail/' + teacher.TeacherId }}
                          className="btn btn-success" type="button">Edit Teacher</Link>
                      </div>
                    </div>
                    <Container>
                      <div className="inner-container mt-4">
                        <Row>
                          <Col lg={4} md={4}>
                            <Form.Label>Pupil name</Form.Label>
                            <p>{teacher.FullName}</p>
                          </Col>
                          <Col lg={4} md={4}>
                            <Form.Label>Teaching Year</Form.Label>
                            <p>{teacher.TeachingYear}</p>
                          </Col>
                          <Col lg={4} md={4}>
                            <Form.Label>Unique I.D (auto-generated)</Form.Label>
                            <p>{teacher.UniqueNumber}</p>
                          </Col>
                          <Col lg={4} md={4}>
                            <Form.Label>Email</Form.Label>
                            <p>{teacher.Email}</p>
                          </Col>
                          <Col lg={4} md={4}>
                            <Form.Label>Status</Form.Label>
                            <p>
                              {teacher.Status}
                              <span className='status-icon'>
                                {(teacher.Active) ? <BsCheckLg className='check-icon' /> : <BsXLg className='uncheck-icon' />}
                              </span>
                            </p>
                          </Col>
                        </Row>
                      </div>
                    </Container>
                    <div className="teacher-insight mt-5 pt-3">
                      <h5>Teacher insights</h5>
                      <Row>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#f9ea9b' }}>
                            <CountUp start={0} end={teacher.ScheduledLesson} delay={0} duration={2} />
                            <p>Scheduled Lessons</p>
                          </div>
                        </Col>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#c6ebef' }}>
                            <CountUp start={0} end={teacher.HomeworkSet} delay={0} duration={2} />
                            <p>Homework Set</p>
                          </div>
                        </Col>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#dfb8ee' }}>
                            <CountUp start={0} end={teacher.ActivePupile} delay={0} duration={2} />
                            <p>Active Pupils</p>
                          </div>
                        </Col>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#9ef89a' }}>
                            <CountUp start={0} end={teacher.PreviousLesson} delay={0} duration={2} />
                            <p>Previous Lessons</p>
                          </div>
                        </Col>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#f7cb8e' }}>
                            <CountUp start={0} end={teacher.HomeworkSubmited} delay={0} duration={2} />
                            <p>Homework Submitted</p>
                          </div>
                        </Col>
                        <Col className="d-flex" lg={2} sm={4}>
                          <div className="teacher-counter" style={{ backgroundColor: '#e57a7b' }}>
                            <CountUp start={0} end={teacher.InActivePupile} delay={0} duration={2} />
                            <p>Inactive Pupils</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                ) : null
            }
          </Tab.Pane>
          <Tab.Pane eventKey="teacher-chat">
            {
              (!loading && !error && teacher)
                ? <>
                  <Chat
                    channels={[(user.UserDetialId + '_' + teacher.TeacherId)]}
                    sender={{ Name: user.FullName, Profile: user.ProfilePicture }}
                    receiver={{ Name: teacher.FullName, Profile: teacher.ProfilePicture }}
                  />
                </>
                : null
            }
          </Tab.Pane>
          <Tab.Pane eventKey="teacherLessonHomework">
            {
              (!loading && !error && teacher)
                ? <>
                  <div ref={visiblEleRef}>
                    {(isVisible) ? <LessonList teacher={teacher} returnTo={'/teacher-management/detail/' + teacher.TeacherId} /> : null}
                  </div>
                </>
                : null
            }
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

export default Detail;
