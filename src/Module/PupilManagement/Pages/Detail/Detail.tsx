import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Col, Container, Form, Nav, Row, Tab, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { Pupil, PupilService } from '../../../../Services/PupilService';
import { IoMdArrowBack } from 'react-icons/io';
import CountUp from 'react-countup';
import { BsCheckLg, BsXLg } from 'react-icons/bs';
import moment from 'moment';
import Chat from '../../../../Components/Chat';
import { useAuth } from '../../../../Core/Providers';
import { ParentService } from "../../../../Services/ParentService";
import { TeacherService, RewardsParam } from "../../../../Services/TeacherService"
import Chart from 'react-apexcharts';
import { Formik } from 'formik';
import * as yup from 'yup';
import ImgBronze from '../../../../Assets/Images/Svg/bronze-unselected.svg';
import ImgSilver from '../../../../Assets/Images/Svg/silver-unselected.svg';
import ImgGold from '../../../../Assets/Images/Svg/gold-unselected.svg';
import Image from '../../../../Components/Image';
import ImgNoPupil from '../../../../Assets/Images/Svg/no-pupil.svg';
import './Detail.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  pupil: Pupil | undefined;
  error: string | null;
  returnTo: string;
}

function Heading(props: HeadingProps) {

  const { loading, pupil, error, returnTo } = props;

  if (!loading && pupil) {
    return <>
      <h2 className="header-title">
        <Link to={returnTo}><IoMdArrowBack /></Link>
        <Helmet>
          <title>
            {pupil?.FullName}
          </title>
        </Helmet>
        {pupil?.FullName}
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
  pupil: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string
};

type AfterHeaderProps = {
  utype?: string;
  loading: boolean;
  pupil: Pupil | undefined;
  error: string | null;
  returnTo: string;
  defaultActiveTab: string;
  onSelectTab: ((key: any) => void);
}

function AfterHeader(props: AfterHeaderProps) {

  const { utype, loading, pupil, error, defaultActiveTab, onSelectTab } = props;
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

  if (!loading && pupil) {
    return <>
      <div className="app-header-tab-filter">
        <div className="header-tabs">
          <Tab.Container id="pupil-tabs" onSelect={onSelect} activeKey={activeTab}>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="pupil-profile">Pupil Profile</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="parent-chat">Parent Chat</Nav.Link>
              </Nav.Item>
              {
                (utype === 'teacher')
                  ? <>
                    <Nav.Item>
                      <Nav.Link eventKey="pupil-chat">Pupil Chat</Nav.Link>
                    </Nav.Item>
                  </>
                  : null
              }
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
                {
                  (utype === 'teacher')
                    ? <>
                      <Nav.Item>
                        <Nav.Link><Skeleton containerClassName="skeleton" width={100} inline={true} /></Nav.Link>
                      </Nav.Item>
                    </>
                    : null
                }
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
  pupil: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
  defaultActiveTab: PropTypes.string,
  onSelectTab: PropTypes.func
};

function Detail() {

  const defaultActiveTab = 'pupil-profile';
  const pupilID: any = useParams().id;
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [pupil, setPupil] = useStateMounted<Pupil>();
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const pupilService = new PupilService();
  const layout = useLayout();
  const user = useAuth().user();
  const [lesson, setLesson] = useStateMounted(0);
  const [homework, setHomework] = useStateMounted(0);
  const parentService = new ParentService();
  const teacherService = new TeacherService();
  const formRef = useRef<HTMLFormElement>(null);
  const [showError, setShowError] = useStateMounted<string | null>(null);

  const state = {
    options: {
      labels: ["Engagement", "Effort"],
      colors: ['#bc8bff', '#fabb23'],
      plotOptions: {
        radialBar: {
          size: undefined,
          inverseOrder: false,
          startAngle: 0,
          endAngle: 360,
          offsetX: 0,
          offsetY: 0,
        }
      }
    },
  };

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  useEffect(() => {
    (async () => {
      await getPupil();
      getLesson();
      getHomework();

    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pupilID]);

  const getLesson = async () => {
    await parentService.getLesson(pupilID)
      .then((res) => {
        setLesson(res.percentage ? res.percentage : 0);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getHomework = async () => {
    await parentService.getHomework(pupilID)
      .then((res) => {
        setHomework(res.percentage ? res.percentage : 0);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        pupil={pupil}
        returnTo={returnTo}
      />
    </>;
    const afterHeader = <>
      <AfterHeader
        utype={user.userType.Type}
        error={error}
        loading={loading}
        pupil={pupil}
        defaultActiveTab={defaultActiveTab}
        returnTo={returnTo}
        onSelectTab={onSelectTab}
      />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'pupil-detail-header',
      mainContentClass: (pupil) ? 'pupil-detail-main' : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, pupil, error, returnTo, defaultActiveTab, user]);


  const getPupil = async () => {
    setLoading(true);
    setError(null);
    await pupilService.get(pupilID)
      .then((res) => {
        setPupil(res);
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

  const onSubmit = async (values) => {
    const params: RewardsParam = {
      Feedback: values.Feedback,
      Reward: values.Reward,
      TeacherID: user.id,
      PupilID: pupilID,
      CreatedBy: user.id
    };
    await teacherService.addInstantReward(params)
      .then(() => {
        console.log("Success");
      })
      .catch((e) => {
        if (e.type === 'client') {
          setShowError(e.message);
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });
  }
  const getInitialValues = () => {
    return {
      Feedback: '',
      Reward: '',
    };
  };

  const formlik = () => {
    return {
      validationSchema: yup.object().shape({
        Feedback: yup.string().required('Please enter feedback review'),
        Reward: yup.string().required('Select reward for homework')
      }),
      initialValues: getInitialValues(),
      enableReinitialize: (homework) ? true : false,
      onSubmit: onSubmit
    }
  };
  return (
    <div className="app-pupil-detail">
      <Tab.Container id="pupil-detail-tabs" activeKey={activeTab}>
        <Tab.Content>
          <Tab.Pane eventKey="pupil-profile">
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
              (!loading && !error && !pupil)
                ?
                <div className="app-empty-screen">
                  <div className="app-empty-icon">
                    <Image src={ImgNoPupil} alt="Not record found" />
                  </div>
                  <div className="app-empty-content">
                    <h3>There doesn’t seem to be any pupils here</h3>
                    <p>Start adding pupils to invite them to join the school</p>
                  </div>
                </div>
                : null
            }
            {
              (!loading && !error && pupil)
                ? (
                  <Formik {...formlik()}>
                    {({ handleSubmit, handleChange, touched, values, setValues, isSubmitting, errors }) => (
                      <Form ref={formRef} onSubmit={handleSubmit} >
                        <div className='pupil-profile-view'>
                          <div className="profile-banner">
                            <div className="profile-pic">
                              <Image domain="server" src={pupil?.ProfilePicture} alt={pupil?.FullName} />
                            </div>
                            <div className="edit-profile">
                              <Link
                                to={'/pupil-management/edit/' + pupil?.id}
                                state={{ returnTo: '/pupil-management/detail/' + pupil?.id }}
                                className="btn btn-success" type="button">Edit Pupil</Link>
                            </div>
                          </div>
                          <Container>
                            <div className="inner-container mt-4">
                              <Row>
                                <Col lg={4} md={4}>
                                  <Form.Label>Pupil name</Form.Label>
                                  <p>{pupil.FullName}</p>
                                </Col>
                                <Col lg={4} md={4}>
                                  <Form.Label>Date of Birth</Form.Label>
                                  <p>{moment(pupil.Dob).format('DD/MM/YYYY')}</p>
                                </Col>
                                <Col lg={4} md={4}>
                                  <Form.Label>Unique I.D (auto-generated)</Form.Label>
                                  <p>{pupil.UniqueNumber}</p>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={4} md={4}>
                                  <Form.Label>Parents Name</Form.Label>
                                  <p>{pupil.parentFullName}</p>
                                </Col>
                                <Col lg={4} md={4}>
                                  <Form.Label>Parents Email</Form.Label>
                                  <p>{pupil.Email}</p>
                                </Col>
                                <Col lg={4} md={4}>
                                  <Form.Label>Parent Tel.</Form.Label>
                                  <p>{pupil.MobileNumber}</p>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={4} md={4}>
                                  <Form.Label>Assigned to</Form.Label>
                                  <p>{pupil.TeacherList.map((teacher) => teacher.Name).join(', ')}</p>
                                </Col>
                                <Col lg={4} md={4}>
                                  <Form.Label>Status</Form.Label>
                                  <p>
                                    {pupil.Status}
                                    <span className='status-icon'>
                                      {(pupil.IsActive) ? <BsCheckLg className='check-icon' /> : <BsXLg className='uncheck-icon' />}
                                    </span>
                                  </p>
                                </Col>
                              </Row>
                            </div>
                          </Container>

                          <div className='reward-feedback'>
                            <Row>
                              <Col lg={4} sm={12}>
                                <div className="reward">
                                  <Row>
                                    <div className="reward-part">
                                      <label>Instant reward for homework</label>
                                      <div className="reward-starts">
                                        <ul>
                                          <li>
                                            <Form.Check className="app-reward" id='bronze'>
                                              <Form.Check.Input
                                                value={'3'}
                                                checked={values.Reward === '3'}
                                                onChange={handleChange}
                                                name="Reward" className="bronze" type="radio"></Form.Check.Input>
                                              <Form.Check.Label>
                                                <Image src={ImgBronze} alt="Bronze Stars" />
                                                <span className="reward-title">Bronze Stars</span>
                                              </Form.Check.Label>
                                            </Form.Check>
                                          </li>
                                          <li>
                                            <Form.Check className="app-reward" id='silver'>
                                              <Form.Check.Input
                                                value={'6'}
                                                defaultChecked={values.Reward === '6'}
                                                onChange={handleChange}
                                                name="Reward" className="silver" type="radio"></Form.Check.Input>
                                              <Form.Check.Label>
                                                <Image src={ImgSilver} alt="Silver Stars" />
                                                <span className="reward-title">Silver Stars</span>
                                              </Form.Check.Label>
                                            </Form.Check>
                                          </li>
                                          <li>
                                            <Form.Check className="app-reward" id='gold'>
                                              <Form.Check.Input
                                                value={'9'}
                                                checked={values.Reward === '9'}
                                                onChange={handleChange}
                                                name="Reward" className="gold" type="radio"></Form.Check.Input>
                                              <Form.Check.Label>
                                                <Image src={ImgGold} alt="Gold Stars" />
                                                <span className="reward-title">Gold Stars</span>
                                              </Form.Check.Label>
                                            </Form.Check>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </Row>
                                  {
                                    (errors.Reward)
                                      ? <>
                                        <div className='invalid-feedback d-block'>{errors.Reward}</div>
                                      </>
                                      : null
                                  }
                                </div>
                              </Col>
                              <Col lg={8} sm={12}>
                                <div className="feedback">
                                  <Row>
                                    <div className="description">
                                      <div className="label-button">
                                        <label>Annotation</label>
                                        <Button type="submit" className='btn btn-success check '><BsCheckLg /></Button>
                                      </div>
                                      <Form.Control as="textarea" placeholder="Leave feedback here"
                                        name="Feedback"
                                        onChange={handleChange}
                                        value={values.Feedback}
                                        isValid={touched.Feedback && !errors.Feedback}
                                        isInvalid={!!errors.Feedback} />
                                      <Form.Control.Feedback type="invalid">{errors.Feedback}</Form.Control.Feedback>
                                    </div>
                                  </Row>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <h5 className='performance-title'>Pupil's performance  </h5>
                          <div className='main-detail-container'>
                            <div className="first-box-container">
                              <div className="left-container">
                                <div className="circle-graph">
                                  <div className="donut">
                                    <Chart
                                      options={state.options}
                                      series={[lesson, homework] ? [lesson, homework] : [0, 0]}
                                      type="radialBar"
                                      width="350"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="right-container">
                                <div className="pupil-heading title">
                                  Pupil are engaged and using the app and submitting home on time
                                </div>
                                <div className="performance-title ">
                                  <div className="small-box orchid  ">
                                  </div>
                                  <div className="title">
                                    Pupil engagement over last month
                                  </div>
                                </div>
                                <div className="performance-title">
                                  <div className="small-box yellow ">
                                  </div>
                                  <div className="title">
                                    Pupil effort over last month
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="pupil-insight mt-5 pt-3">
                            <h5>Pupil insights</h5>
                            <Row>
                              <Col className="d-flex" lg={2} sm={4}>
                                <div className="pupil-counter" style={{ backgroundColor: '#f9ea9b' }}>
                                  <CountUp start={0} end={pupil.LessonMastercount?.JoinLesson} delay={0} duration={2} />
                                  <p>Attended Lessons</p>
                                </div>
                              </Col>
                              <Col className="d-flex" lg={2} sm={4}>
                                <div className="pupil-counter" style={{ backgroundColor: '#c6ebef' }}>
                                  <CountUp start={0} end={pupil.HomeworkCount?.Submited} delay={0} duration={2} />
                                  <p>Homework Submitted</p>
                                </div>
                              </Col>
                              <Col className="d-flex" lg={2} sm={4}>
                                <div className="pupil-counter" style={{ backgroundColor: '#dfb8ee' }}>
                                  <CountUp start={0} end={pupil.LessonMastercount?.MissedLesson} delay={0} duration={2} />
                                  <p>Missed Lessons</p>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : null
            }
          </Tab.Pane>
          <Tab.Pane eventKey="parent-chat">
            {
              (!loading && !error && pupil)
                ? <>
                  <Chat
                    channels={[(pupil.MobileNumber + '_' + user.id)]}
                    sender={{ Name: user.FullName, Profile: user.ProfilePicture }}
                    receiver={{ Name: pupil.parentFullName, Profile: pupil.ProfilePicture }}
                  />
                </>
                : null
            }
          </Tab.Pane>
          {
            (user.userType.Type === 'teacher')
              ? <>
                <Tab.Pane eventKey="pupil-chat">
                  {
                    (!loading && !error && pupil)
                      ? <>
                        <Chat
                          channels={[(pupil.id + '_' + user.id)]}
                          sender={{ Name: user.FullName, Profile: user.ProfilePicture }}
                          receiver={{ Name: pupil.FullName, Profile: pupil.ProfilePicture }}
                        />
                      </>
                      : null
                  }
                </Tab.Pane>
              </>
              : null
          }
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

export default Detail;
