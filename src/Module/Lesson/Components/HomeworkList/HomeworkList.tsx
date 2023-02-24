import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../../Core/Hooks';
import { Homework, HomeworkService } from '../../../../Services/HomeworkService';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Image } from '../../../../Components';
import { Swiper, SwiperSlide } from "swiper/react";
import { useAuth } from '../../../../Core/Providers';
import DueIcon from '../../../../Assets/Images/Svg/due-icon.svg';
import SubmittedIcon from '../../../../Assets/Images/Svg/hw-submitted.svg';
import MarkedIcon from '../../../../Assets/Images/Svg/marked-icon.svg';
import moment from 'moment';
import { BsBookmark } from 'react-icons/bs';
import ImgNoLesson from '../../../../Assets/Images/Svg/no-lesson.svg';
import "swiper/css";
import './HomeworkList.scss';

type HomeworkListProps = {
  searchList: object | undefined;
}

function HomeworkList(props: HomeworkListProps) {

  const { searchList } = props;

  const [search, setSearch] = useStateMounted<object>();
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [dueList, setDueList] = useStateMounted<Homework[]>([]);
  const [homeworkList, setHomeworkList] = useStateMounted<Homework[]>([]);
  const [markedList, setMarkedList] = useStateMounted<Homework[]>([]);
  const [submitedkList, setSubmittedList] = useStateMounted<Homework[]>([]);
  const homeworkService = new HomeworkService();
  const user = useAuth().user();

  useEffect(() => {
    setDueList([]);
    setSubmittedList([]);
    setMarkedList([]);
    setHomeworkList([]);
    setSearch(searchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchList]);

  useEffect(() => {
    (async () => {
      if (search) {
        await getHomework(search);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const getHomework = async (search) => {
    setLoading(true);
    setError(null);
    await homeworkService.getAllPupilHomework(user.UserDetialId, search)
      .then((res) => {
        const dueHomework = res.filter((h) => !h.Submited && !h.Marked);
        const submitedHomework = res.filter((h) => h.Submited && !h.Marked);
        const markedHomework = res.filter((h) => h.Marked);
        setDueList(dueHomework);
        setSubmittedList(submitedHomework);
        setMarkedList(markedHomework);
        setHomeworkList(res);
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

  const isToday = (date) => {
    const today = moment().format('DD/MM/YYYY');
    return moment(date).format('DD/MM/YYYY') === today;
  }


  const LoadingSkeleton = (props) => {
    return <>
      {
        [...Array(props.row)].map((j, i) => {
          return (
            <div key={i} className="homework-data">
              <h3><Skeleton containerClassName="skeleton" inline={true} width="50%" height="30px" /></h3>
              <div className="homework-list-slider">
                <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                  {
                    [...Array(props.col)].map((j, i) => {
                      return (
                        <SwiperSlide key={i}>
                          <div className="app-homework-hw-item">
                            <Link to="#">
                              <div className="homework-thumb">
                                <div className="app-thumb-detail">
                                  <div className="due-submit-date">
                                    <Skeleton containerClassName="skeleton" inline={true} width="140px" height="24px" />
                                  </div>
                                  {/* <div className="app-bookmark">
                                    <Skeleton containerClassName="skeleton" inline={true} width="19px" height="19px" />
                                  </div> */}
                                </div>
                              </div>
                              <Skeleton containerClassName="skeleton" inline={true} height="135px" />
                              <div className="app-homework-author">
                                <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
                                <h5 className='ml-1'><Skeleton containerClassName="skeleton" inline={true} width="100px" /></h5>
                              </div>
                            </Link>
                          </div>
                        </SwiperSlide>
                      )
                    })
                  }
                </Swiper>
              </div>
            </div>
          );
        })
      }
    </>
  };

  return (
    <>
      <div className="app-homework-list pupil-homework-list">
        {(loading) ? <LoadingSkeleton row={2} col={5} /> : null}
        {(error) ? <div className='fetch-error text-danger'>{error}</div> : null}
        {
          (!loading && !error && (homeworkList && homeworkList.length === 0))
            ?
            <div className='no-record'>
              <div className="app-empty-screen">
                <div className="app-empty-icon">
                  <Image src={ImgNoLesson} alt="Not record found" />
                </div>
                <div className="app-empty-content">
                  <h3>You have no lessons or homework yet</h3>
                  <p>Start planning to add new lessons or homework here</p>
                </div>
              </div>
            </div>
            : null
        }
        {
          ((dueList && dueList.length))
            ? <>
              <div className="homework-data">
                <h3>Homework due</h3>
                <div className="homework-list-slider">
                  <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                    {
                      dueList.map((homework, i) => {
                        return (
                          <SwiperSlide key={i}>
                            <div className="app-homework-hw-item">
                              <Link to={'/lesson/homework-detail/' + homework.LessonId} state={{ returnTo: '/lesson' }} title={homework.SubjectName}>
                                <div className="homework-thumb">
                                  <div className="app-thumb-detail">
                                    <div className="due-submit-date">
                                      {(isToday(homework.HomeWorkDate)) ? <Image src={DueIcon} alt={homework.SubjectName} /> : null}
                                      <span className='app-date'>Due: {(isToday(homework.HomeWorkDate)) ? 'Today' : moment(homework.HomeWorkDate).format('DD/MM/YYYY')}</span>
                                    </div>
                                    {/* <div className="app-bookmark">
                                      <BsBookmark />
                                    </div> */}
                                  </div>
                                </div>
                                <div className="app-pupil-homework-detail" style={{ backgroundColor: homework.SubjectColor }}>
                                  <h4>{homework.SubjectName}</h4>
                                  <h3>{homework.LessonTopic}</h3>
                                </div>
                                <div className="app-homework-author">
                                  <Image domain='server' src={homework.TeacherProfile} alt={homework.TeacherFullName} />
                                  <h5>{homework.TeacherFullName}</h5>
                                </div>
                              </Link>
                            </div>
                          </SwiperSlide>
                        );
                      })
                    }
                  </Swiper>
                </div>
              </div>
            </>
            : null
        }
        {
          ((submitedkList && submitedkList.length))
            ? <>
              <div className="homework-data">
                <h3>Submitted homework</h3>
                <div className="homework-list-slider">
                  <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                    {
                      submitedkList.map((homework, i) => {
                        return (
                          <SwiperSlide key={i}>
                            <div className="app-homework-hw-item">
                              <Link to={'/lesson/homework-submitted-marked/' + homework.LessonId} state={{ returnTo: '/lesson' }} title={homework.SubjectName}>
                                <div className="homework-thumb">
                                  <div className="app-thumb-detail">
                                    <div className="due-submit-date">
                                      <Image src={SubmittedIcon} alt={homework.SubjectName} />
                                      <span className="app-date">Submitted: {moment(homework.SubmitedDate).format('DD/MM/YYYY')}</span>
                                    </div>
                                    {/* <div className="app-bookmark">
                                      <BsBookmark />
                                    </div> */}
                                  </div>
                                </div>
                                <div className="app-pupil-homework-detail" style={{ backgroundColor: homework.SubjectColor }}>
                                  <h4>{homework.SubjectName}</h4>
                                  <h3>{homework.LessonTopic}</h3>
                                </div>
                                <div className="app-homework-author">
                                  <Image domain='server' src={homework.TeacherProfile} alt={homework.TeacherFullName} />
                                  <h5>{homework.TeacherFullName}</h5>
                                </div>
                              </Link>
                            </div>
                          </SwiperSlide>
                        );
                      })
                    }
                  </Swiper>
                </div>
              </div>
            </>
            : null
        }
        {
          ((markedList && markedList.length))
            ? <>
              <div className="homework-data">
                <h3>Homework marked</h3>
                <div className="homework-list-slider">
                  <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                    {
                      markedList.map((homework, i) => {
                        return (
                          <SwiperSlide key={i}>
                            <div className="app-homework-hw-item">
                              <Link to={'/lesson/homework-submitted-marked/' + homework.LessonId} state={{ returnTo: '/lesson' }} title={homework.SubjectName}>
                                <div className="homework-thumb">
                                  <div className="app-thumb-detail">
                                    <div className="due-submit-date">
                                      <Image src={MarkedIcon} alt={homework.SubjectName} />
                                      <span className="app-date">Marked</span>
                                    </div>
                                    {/* <div className="app-bookmark">
                                      <BsBookmark />
                                    </div> */}
                                  </div>
                                </div>
                                <div className="app-pupil-homework-detail" style={{ backgroundColor: homework.SubjectColor }}>
                                  <h4>{homework.SubjectName}</h4>
                                  <h3>{homework.LessonTopic}</h3>
                                </div>
                                <div className="app-homework-author">
                                  <Image domain='server' src={homework.TeacherProfile} alt={homework.TeacherFullName} />
                                  <h5>{homework.TeacherFullName}</h5>
                                </div>
                              </Link>
                            </div>
                          </SwiperSlide>
                        );
                      })
                    }
                  </Swiper>
                </div>
              </div>
            </>
            : null
        }
      </div>
    </>
  );
}

HomeworkList.propTypes = {
  searchList: PropTypes.object.isRequired
};

export default HomeworkList;
