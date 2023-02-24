import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Nav, Row, Tab } from 'react-bootstrap';
import Scrollbars from 'react-custom-scrollbars';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import Image from '../../../../Components/Image';
import { Link } from 'react-router-dom';
import { useStateMounted } from '../../../../Core/Hooks';
import { Homework, HomeworkService } from '../../../../Services/HomeworkService';
import Skeleton from 'react-loading-skeleton';
import ImgNoHomework from '../../../../Assets/Images/Svg/no-lesson.svg';
import './MyHomework.scss';
import moment from 'moment';
import { FieldArray, Formik } from 'formik';

type MyHomeworkProps = {
  utype: string;
}

type ContentLinkProps = {
  myHomework: Homework[];
  activeTab: number;
  utype: string;
}

function Links(props: ContentLinkProps) {

  const { myHomework } = props;

  return (
    <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          {
            myHomework.map((homework, i) => {
              return (
                <Nav.Link key={i} eventKey={i}>
                  <div className="tabLink">
                    <div className="tabSub">
                      <div className="subLine" style={{ backgroundColor: homework.SubjectColor }}></div>
                      <div className="sub">
                        <span>{homework.SubjectName}</span>{homework.LessonTopic}
                      </div>
                    </div>
                    <div className="tabSub time">
                      <div className="group"><span>{homework.GroupName}</span></div>
                      <time>{homework.StartTime} - {homework.EndTime}</time>
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
  myHomework: PropTypes.array,
  activeTab: PropTypes.any,
  utype: PropTypes.string
};

function Content(props: ContentLinkProps) {

  const { myHomework, activeTab } = props;
  const homework: any = (myHomework && myHomework[activeTab]) ? myHomework[activeTab] : {};

  const isToday = (date) => {
    const today = moment().format('DD/MM/YYYY');
    return moment(date).format('DD/MM/YYYY') === today;
  }

  const getInitialValues = () => {
    const checkList: any = homework?.CheckList || [];
    return {
      CheckList: checkList,
    };
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
  };

  const formlik = () => {
    return {
      initialValues: getInitialValues(),
      enableReinitialize: true,
      onSubmit: onSubmit
    }
  };

  return (
    <Tab.Content>
      <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
        {
          (homework)
            ? (
              <div className="content-inner">
                <div className="title-bar">
                  <h2>{homework.LessonTopic}</h2>
                  <div className="date-time-group">
                    <div className="date common-dtg">
                      <Image src="/assets/images/svg/calendar-small-icon.svg" alt="Date" />
                      <span>{(isToday(homework.HomeWorkDate)) ? 'Today' : moment(homework.HomeWorkDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="subject common-dtg">
                      <Image src="/assets/images/svg/subject.svg" alt="Group" />
                      <span>{homework.SubjectName}</span>
                    </div>
                  </div>
                </div>
                <div className="content">
                  <p>{homework.HomeworkDescription}</p>
                </div>
                <Formik {...formlik()}>
                  {
                    ({ handleSubmit, handleChange, touched, values, isSubmitting, errors }) => (
                      <>
                        <Form onSubmit={handleSubmit}>
                          <FieldArray name="CheckList">
                            {
                              ({ push, remove }) => (
                                <>
                                  <div className="checkbox-section">
                                    <h4>Maake sure you:</h4>
                                    <ul>
                                      {
                                        values.CheckList.map((item, i) => {
                                          return <li className="title-bar" key={i}>
                                            <Form.Check
                                              label={item.ItemName}
                                              name={`CheckList.${i}.IsCheck`}
                                              type="checkbox"
                                              // readOnly={true}
                                              checked={item.IsCheck}
                                              onChange={handleChange}
                                              disabled={true} />
                                          </li>;
                                        })
                                      }
                                    </ul>
                                  </div>
                                </>
                              )
                            }
                          </FieldArray>

                          <div className="btn-area text-right mt-50">
                            <Link to={'/lesson/homework-detail/' + homework.LessonId}>
                              <Button variant="success" className="ml-1" type="button">See Homework</Button>
                            </Link>
                          </div>
                        </Form>
                      </>
                    )
                  }
                </Formik>
              </div>
            )
            : null
        }
      </Scrollbars>
    </Tab.Content>
  );

}

Content.propTypes = {
  myHomework: PropTypes.array,
  activeTab: PropTypes.any,
  utype: PropTypes.string
};

function LoadingSkeleton() {

  return (
    <Tab.Container id="homework-tabs" defaultActiveKey="0">
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
                    [...Array(2)].map((j, i) => {
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
              <div className="content">
                <p>
                  <Skeleton style={{ marginBottom: '5px' }} containerClassName="skeleton" inline={true} width="100%" height="18px" />
                  <Skeleton containerClassName="skeleton" inline={true} width="60%" height="18px" />
                </p>
              </div>
              <div className="check-list">
                <h4><Skeleton containerClassName="skeleton" inline={true} width="250px" height="21px" /></h4>
                <Skeleton containerClassName="skeleton" width="450px" height="20px" count={5} />
              </div>
            </div>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );

}

function MyHomework(props: MyHomeworkProps) {

  const { utype } = props;
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myHomework, setMyHomework] = useStateMounted<Homework[]>([]);
  const [activeTab, setActiveTab] = useStateMounted<number>(0);
  const homeworkService = new HomeworkService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getMyHomework();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  const getMyHomework = async () => {
    setLoading(true);
    setError(null);
    homeworkService.getByPupilID(user.UserDetialId)
      .then((res) => {
        setMyHomework(res);
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
        <div className={'app-my-homework ' + utype + '-homework'}>
          <div className="panel">
            <div className="panel-header">
              <div className="header-inner">
                <h2>My Homework</h2>
              </div>
              <div className="header-inner">
                <Link to="#" className="more-action" title="More Homework">
                  <Image src="/assets/images/svg/more-v-white.svg" alt="More Homework" />
                </Link>
              </div>
            </div>
            <div className="panel-body">
              {
                (loading || error || myHomework.length)
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
                      (!loading && !error && (myHomework && myHomework.length))
                        ? <>
                          <Tab.Container id="homework-tabs" onSelect={onSelectTab} defaultActiveKey="0">
                            <Row>
                              <Col className="p-0 tab-nav-area" lg={4}>
                                <Links myHomework={myHomework} activeTab={activeTab} utype={utype} />
                              </Col>
                              <Col className="p-0 tab-content-area" lg={8}>
                                <Content myHomework={myHomework} activeTab={activeTab} utype={utype} />
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
                (!myHomework.length && (!loading && !error))
                  ? <>
                    <div className="app-empty-screen">
                      <div className="app-empty-icon">
                        <Image src={ImgNoHomework} alt="No Homework" />
                      </div>
                      <div className="app-empty-content">
                        <h3>No Homework</h3>
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

MyHomework.propTypes = {
  utype: PropTypes.string.isRequired
};

export default MyHomework;
