import React, { useEffect } from 'react';
import { Col, Nav, Row, Tab } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Image } from '../../../../Components';
import Chat from '../../../../Components/Chat';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import { PupilService } from '../../../../Services/PupilService';
import { TeacherList } from '../../../../Services/TeacherService';
import './TeacherChat.scss';


function TeacherChat() {

  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [teacherList, setTeacherList] = useStateMounted<TeacherList[]>([]);
  const user = useAuth().user();
  const pupilService = new PupilService();

  useEffect(() => {
    (async () => {
      getTeacherList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTeacherList = async () => {
    setLoading(true);
    setError(null);
    await pupilService.getTeachersList(user.UserDetialId)
      .then((res) => {
        setTeacherList(res);
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

  function LoadingSkeleton() {

    return (
      <Tab.Container id="teacher-chat-tabs" defaultActiveKey="0">
        <Row>
          <Col className="p-0 tab-nav-area" lg={3} md={4}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                {
                  [...Array(4)].map((j, i) => {
                    return (
                      <Nav.Link key={i} eventKey={i}>
                        <Skeleton containerClassName="skeleton mr-1" inline={true} width="25px" height="25px" />
                        <Skeleton containerClassName="skeleton" inline={true} width="200px" height="100%" />
                      </Nav.Link>
                    );
                  })
                }
              </Nav.Item>
            </Nav>
          </Col>
          <Col className="p-0 tab-content-area" lg={9} md={8}>
            <Tab.Content>
              <div className="content-inner">
                {
                  [...Array(5)].map((j, i) => {
                    return (
                      <div style={{ paddingBottom: '20px', display: 'flex' }} key={`content-${i}`}>
                        <Skeleton containerClassName="skeleton mr-1" inline={true} width="35px" height="35px" />
                        <Skeleton containerClassName="skeleton" width="450px" height="20px" count={2} />
                      </div>
                    );
                  })
                }

              </div>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );

  }

  return (
    <div className='teacher-chat'>
      {
        (loading || error || teacherList.length)
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
              (!loading && !error && (teacherList && teacherList.length))
                ? <>
                  <Tab.Container id="teacher-chat-tabs" defaultActiveKey="0">
                    <Row>
                      <Col className="p-0 tab-nav-area" lg={3} md={4}>
                        <Nav variant="pills" className="flex-column">
                          <Nav.Item>
                            {
                              teacherList.map((teacher, i) => {
                                return (
                                  <Nav.Link key={`nav-${i}`} eventKey={i}>
                                    <span className='user-icon mr-1'><Image domain='server' src={teacher.ProfilePicture} alt={teacher.FullName} /></span>
                                    <span>{teacher.FullName}</span>
                                  </Nav.Link>
                                );
                              })
                            }
                          </Nav.Item>
                        </Nav>
                      </Col>
                      <Col className="p-0 tab-content-area" lg={9} md={8}>
                        <Tab.Content>
                          {
                            teacherList.map((teacher, i) => {
                              return (
                                <Tab.Pane key={`pane-${i}`} eventKey={i}>
                                  <div className="content-inner">
                                    <Chat
                                      channels={[(user.UserDetialId + '_' + teacher.TeacherID)]}
                                      sender={{ Name: user.FullName, Profile: user.ProfilePicture }}
                                      receiver={{ Name: teacher.FullName, Profile: teacher.ProfilePicture }}
                                    />
                                  </div>
                                </Tab.Pane>
                              )
                            })
                          }
                        </Tab.Content>
                      </Col>
                    </Row>
                  </Tab.Container>
                </>
                : null
            }
          </>
          : null
      }
    </div>
  );
}

export default TeacherChat;
