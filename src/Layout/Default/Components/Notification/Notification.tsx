import React, { useEffect } from 'react';
import { Navbar, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Image from '../../../../Components/Image';
import { useAuth } from '../../../../Core/Providers';
import { MyNotification, MyNotificationService, NotificationParam } from "../../../../Services/NotificationService"
import { useStateMounted } from '../../../../Core/Hooks';
import moment from 'moment';
import './Notification.scss';

function Notification() {

  const user = useAuth().user();
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [showNotification, setShowNotification] = useStateMounted<MyNotification[]>([]);
  const myNotificationService = new MyNotificationService();

  useEffect(() => {
    getNotificationById();
    setInterval(getNotificationById, 300000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotificationById = async () => {
    setLoading(true);
    setError(null);
    const params: NotificationParam = {
      userid: (user.userType.Type === 'teacher') ? user.id : user.UserDetialId,
      page: 1,
      limit: 20,
    };
    await myNotificationService.getAll(params)
      .then((res) => {
        setShowNotification(res);
      })
      .catch((e) => {
        setShowNotification([]);
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const deleteNotification = async (id) => {
    await myNotificationService.deleteNotification(id)
      .then(() => {
        getNotificationById();
      })
      .catch((e) => { });
  }

  return (
    <div className="app-notification">
      <Navbar expand={false}>
        <Navbar.Toggle aria-controls="offcanvasNavbar" />
        <Navbar.Offcanvas id="app-notification" aria-labelledby="offcanvasNavbarLabel" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">My Notifications</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <>
              {(loading) ? <div className='loader-area p-3'>Loading...</div> : null}
              {(error) ? <div className='error-area text-danger p-3'>{error}</div> : null}
              {
                (showNotification && showNotification.length)
                  ? <>
                    {
                      showNotification.map((value, i) => {
                        return (
                          <div className="live-class-notification notification-main" key={i}>
                            <div className="notification-title">
                              <h5>{(value.Type) ? value.Type : "Personal"}</h5>
                            </div>
                            <div className="notification-list">
                              <ul>
                                <li className={(!value.IsSeen) ? 'recent' : 'is-read'}>
                                  <div className="title-closer">
                                    <h4>{value.Description}</h4>
                                    <button className="btn-close" onClick={() => deleteNotification(value.id)}></button>
                                  </div>
                                  {
                                    (value.SubDesc) ? <div className="timeandstarter">
                                      <span className="time">
                                        {
                                          (value.Type === "HOMEWORK") ? <Image src="/assets/images/svg/calendar-small-icon.svg" alt="Calendar" /> : <Image src="/assets/images/svg/clock.svg" alt="Time" />
                                        }
                                        {
                                          (value.Type === "HOMEWORK") ? moment(value.SubDesc).format('YYYY/MM/DD') : value.SubDesc
                                        }
                                      </span>
                                      <Link to="#" className="notification-open-link">open class</Link>
                                    </div> : null
                                  }
                                </li>
                              </ul>
                            </div>
                          </div>
                        )
                      })
                    }
                  </>
                  : null
              }
            </>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </div>
  );
}

export default Notification;
