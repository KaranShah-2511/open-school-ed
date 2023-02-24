import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import Image from '../../../../Components/Image';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { Table } from 'react-bootstrap';
import { FaAngleRight } from "react-icons/fa";
import { useStateMounted } from '../../../../Core/Hooks';
import { Teacher, TeacherService } from '../../../../Services/TeacherService';
import Skeleton from 'react-loading-skeleton';
import ImgNoTeacher from '../../../../Assets/Images/Svg/no-user-data.svg';
import './MyTeachers.scss';

type TeachersProps = {
  utype: string;
}

function Teachers(props: TeachersProps) {

  const { utype } = props;
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [showError, setError] = useStateMounted<string | null>(null);
  const [myTeachers, setMyTeachers] = useStateMounted<Teacher[]>([]);
  const teacherService = new TeacherService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getTeachers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  const getTeachers = async () => {
    setLoading(true);
    setError(null);
    const search = { Filterby: '-1', limit: 8 };
    await teacherService.getBySchoolID(user.UserDetialId, search)
      .then((res) => {
        setMyTeachers(res.teachers);
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
    (utype)
      ? <>
        <div className={'app-my-teachers ' + utype + '-teachers'}>
          <div className="panel">
            <div className="panel-header">
              <div className="header-inner">
                <Image src="/assets/images/svg/user-icon.svg" alt="My Teachers" className="icon" />
                <h2>My Teachers</h2>
              </div>
              <div className="header-inner">
                <Link to="#" className="more-action" title="More Teachers">
                  <Image src="/assets/images/svg/more-v-white.svg" alt="More Teachers" />
                </Link>
              </div>
            </div>
            <div className="panel-body">
              <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
                {
                  (loading || showError || myTeachers.length)
                    ? <>
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th className="first">
                              Name
                              {(myTeachers && myTeachers.length) ? <span>Total {myTeachers.length} Teachers</span> : null}
                            </th>
                            <th className="text-center second">Teaching Year<span></span></th>
                            <th className="text-center third">
                              Scheduled Activity
                              <span className="multiple-row">
                                <span>Lessons</span>
                                <span>Homework</span>
                              </span>
                            </th>
                            <th className="text-center four">
                              Contact
                            </th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            (loading)
                              ? <>
                                {
                                  [...Array(8)].map((j, i) => {
                                    return (
                                      <tr key={i}>
                                        <td className="first">
                                          <div className="profile">
                                            <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
                                            <span><Skeleton style={{ marginLeft: '15px' }} containerClassName="skeleton" inline={true} width="200px" height="30px" /></span>
                                          </div>
                                        </td>
                                        <td className="text-center second">
                                          <Skeleton containerClassName="skeleton" inline={true} width="160px" height="24px" />
                                        </td>
                                        <td className="text-center third">
                                          <div className="d-flex-center">
                                            <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                                            <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                                          </div>
                                        </td>
                                        <td className="text-center four">
                                          <Skeleton containerClassName="skeleton" inline={true} width="150px" height="24px" />
                                        </td>
                                        <td className="text-center">
                                          <Link to="#"><Skeleton containerClassName="skeleton" inline={true} width="20px" /></Link>
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </>
                              : null
                          }
                          {
                            (showError)
                              ? <tr><td colSpan={5}>{showError}</td></tr>
                              : null
                          }
                          {
                            (!loading && !showError && (myTeachers && myTeachers.length))
                              ? (
                                myTeachers.map((teacher, i) => {
                                  return (
                                    <tr key={i}>
                                      <td className="first">
                                        <div className="profile">
                                          <Image domain="server" src={teacher.ProfilePicture} alt={teacher.FullName} />
                                          <span>{teacher.FullName}</span>
                                        </div>
                                      </td>
                                      <td className="text-center second">{teacher.TeachingYear}</td>
                                      <td className="text-center third">
                                        <div className="d-flex-center">
                                          <span>{teacher.HomeworkCount}</span>
                                          <span>{teacher.LessonCount}</span>
                                        </div>
                                      </td>
                                      <td className="text-center four">{teacher.Email}</td>
                                      <td className="text-center">
                                        <Link
                                          to={"/teacher-management/detail/" + teacher.TeacherId}
                                          state={{ returnTo: '/dashboard' }}><FaAngleRight /></Link>
                                      </td>
                                    </tr>
                                  );
                                })
                              )
                              : null
                          }
                        </tbody>
                      </Table>
                    </>
                    : null
                }
                {
                  (!myTeachers.length && (!loading && !showError))
                    ? <>
                      <div className="app-empty-screen">
                        <div className="app-empty-icon">
                          <Image src={ImgNoTeacher} alt="Teachers Empty" />
                        </div>
                        <div className="app-empty-content">
                          <h3>No teachers here yet</h3>
                          <p>Go to the teacher management section to start adding teachers</p>
                        </div>
                      </div>
                    </>
                    : null
                }
              </Scrollbars>
            </div>
          </div>
        </div>
      </>
      : null
  );
}

Teachers.propTypes = {
  utype: PropTypes.string.isRequired
};

export default Teachers;
