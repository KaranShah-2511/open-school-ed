import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../../Core/Hooks';
import { Lesson, LessonService } from '../../../../Services/LessonService';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Image } from '../../../../Components';
import { Swiper, SwiperSlide } from "swiper/react";
import { useAuth } from '../../../../Core/Providers';
import LessonThumb from '../../../../Assets/Images/Svg/english-thumb.svg';
import moment from 'moment';
import { BsBookmark, BsFillBookmarkFill } from 'react-icons/bs';
import { WeekDays, weekDays } from '../../../../Core/Utility/Datetime';
import ImgNoLesson from '../../../../Assets/Images/Svg/no-lesson.svg';
import "swiper/css";
import './LessonList.scss';

type LessonListProps = {
  searchList: object | undefined;
}

function LessonList(props: LessonListProps) {

  const { searchList } = props;

  const [search, setSearch] = useStateMounted<object>();
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [lessonList, setLessonList] = useStateMounted<Lesson[]>([]);
  const [weekLessonList, setWeekLessonList] = useStateMounted<Lesson[]>([]);
  const [otherLessonList, setOtherLessonList] = useStateMounted<Lesson[]>([]);
  const lessonService = new LessonService();
  const weekDay: WeekDays[] = weekDays(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  const user = useAuth().user();

  useEffect(() => {
    setWeekLessonList([]);
    setOtherLessonList([]);
    setLessonList([]);
    setSearch(searchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchList]);

  useEffect(() => {
    (async () => {
      if (search) {
        await getLesson(search);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const getLesson = async (search) => {
    setLoading(true);
    setError(null);
    await lessonService.getAllPupilLesson(user.UserDetialId, search)
      .then((res) => {
        const weekDate = weekDay.map((d) => { return d.date });
        const weekLessones = res.filter((l) => weekDate.includes(moment(l.LessonDate).format('DD/MM/YYYY')));
        const otherLessones = res.filter((l) => !weekDate.includes(moment(l.LessonDate).format('DD/MM/YYYY')));
        setWeekLessonList(weekLessones);
        setOtherLessonList(otherLessones);
        setLessonList(res);
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

  const LoadingSkeleton = (props) => {
    return <>
      {
        [...Array(props.row)].map((j, i) => {
          return (
            <div key={i} className="lesson-data">
              <h3><Skeleton containerClassName="skeleton" inline={true} width="50%" height="30px" /></h3>
              <div className="lesson-list-slider">
                <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                  {
                    [...Array(props.col)].map((j, i) => {
                      return (
                        <SwiperSlide key={i}>
                          <div className="app-lesson-item">
                            <Link to="#">
                              <div className="lesson-thumb">
                                <Skeleton containerClassName="skeleton" inline={true} height="161px" />
                              </div>
                              <div className="app-pupil-lesson-detail">
                                <h4><Skeleton containerClassName="skeleton" inline={true} width="50%" height="20px" /></h4>
                                <h3><Skeleton containerClassName="skeleton" inline={true} width="70%" height="22px" /></h3>
                                <div className="app-lesson-author">
                                  <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
                                  <h5 className='ml-1'><Skeleton containerClassName="skeleton" inline={true} width="100px" /></h5>
                                </div>
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
      <div className="app-lesson-list pupil-lesson-list">
        {(loading) ? <LoadingSkeleton row={2} col={5} /> : null}
        {(error) ? <div className='fetch-error text-danger'>{error}</div> : null}
        {
          (!loading && !error && (lessonList && lessonList.length === 0))
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
          ((weekLessonList && weekLessonList.length))
            ? <>
              <div className="lesson-data">
                <h3>Lessons for this Week - {moment().format('DD/MM/YY')}</h3>
                <div className="lesson-list-slider">
                  <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                    {
                      weekLessonList.map((lesson, i) => {
                        return (
                          <SwiperSlide key={i}>
                            <div className="app-lesson-item">
                              <Link to={'/lesson/detail/' + lesson.LessonId} state={{ returnTo: '/lesson' }} title={lesson.LessonTopic}>
                                <div className="lesson-thumb">
                                  <Image src={LessonThumb} alt={lesson.SubjectName} />
                                  <div className="app-thumb-detail">
                                    <span className="app-date">{moment(lesson.LessonDate).format('DD/MM/YYYY')}</span>
                                    <div className="app-bookmark">
                                      {(lesson.SaveLesson) ? <BsFillBookmarkFill className='save' /> : <BsBookmark />}
                                    </div>
                                  </div>
                                </div>
                                <div className="app-pupil-lesson-detail">
                                  <h4>{lesson.SubjectName}</h4>
                                  <h3>{lesson.LessonTopic}</h3>
                                  <div className="app-lesson-author">
                                    <Image domain='server' src={lesson.TeacherProfile} alt={lesson.TeacherFullName} />
                                    <h5>{lesson.TeacherFullName}</h5>
                                  </div>
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
          ((otherLessonList && otherLessonList.length))
            ? <>
              <div className="lesson-data">
                <h3>Lessons from last Week - {weekDay[0].moment.add(-1).format('DD/MM/YY')}</h3>
                <div className="lesson-list-slider">
                  <Swiper slidesPerView={4} spaceBetween={15} grabCursor={true}>
                    {
                      otherLessonList.map((lesson, i) => {
                        return (
                          <SwiperSlide key={i}>
                            <div className="app-lesson-item">
                              <Link to={'/lesson/detail/' + lesson.LessonId} state={{ returnTo: '/lesson' }} title={lesson.LessonTopic}>
                                <div className="lesson-thumb">
                                  <Image src={LessonThumb} alt={lesson.SubjectName} />
                                  <div className="app-thumb-detail">
                                    <span className="app-date">{moment(lesson.LessonDate).format('DD/MM/YYYY')}</span>
                                    <div className="app-bookmark">
                                      {(lesson.SaveLesson) ? <BsFillBookmarkFill className='save' /> : <BsBookmark />}
                                    </div>
                                  </div>
                                </div>
                                <div className="app-pupil-lesson-detail">
                                  <h4>{lesson.SubjectName}</h4>
                                  <h3>{lesson.LessonTopic}</h3>
                                  <div className="app-lesson-author">
                                    <Image domain='server' src={lesson.TeacherProfile} alt={lesson.TeacherFullName} />
                                    <h5>{lesson.TeacherFullName}</h5>
                                  </div>
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

LessonList.propTypes = {
  searchList: PropTypes.object.isRequired
};

export default LessonList;
