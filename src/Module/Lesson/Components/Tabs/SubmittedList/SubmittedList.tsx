import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Lesson } from '../../../../../Services/LessonService';
import { useInfiniteScroll, useStateMounted } from '../../../../../Core/Hooks';
import { Homework, HomeworkService } from '../../../../../Services/HomeworkService';
import Skeleton from 'react-loading-skeleton';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import { Image } from '../../../../../Components';
import ImgNoUser from '../../../../../Assets/Images/Svg/no-user-data.svg';
import moment from 'moment';
import './SubmittedList.scss';

type SubmittedListProps = {
  utype: string;
  lesson: Lesson;
  searchList: object | undefined;
}

function SubmittedList(props: SubmittedListProps) {

  const { lesson, utype, searchList } = props;

  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [isEdit, setIsEdit] = useStateMounted(false);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>();
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [homeworkList, setHomeworkList] = useStateMounted<Homework[]>([]);
  const homeworkService = new HomeworkService();

  useEffect(() => {
    setIsEdit((utype === 'teacher') ? true : false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  useEffect(() => {
    setHomeworkList([]);
    setNextPage(false);
    setSearch(searchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchList]);

  useEffect(() => {
    (async () => {
      if (lesson.homeWork && search) {
        await getSubmittedHomework(lesson.id, search);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!isScroll) return;
    if (!nextPage) return;
    setSearch((prevSearch) => {
      return { ...prevSearch, page: nextPage };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScroll, nextPage]);


  const getSubmittedHomework = async (lessionID, search) => {
    setLoading(true);
    setError(null);
    await homeworkService.getSubmitedListByLessonID(lessionID, search)
      .then((res) => {
        setHomeworkList((prevHomework) => {
          return [...prevHomework, ...res.homeworkList];
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
              <td className="first">
                <div className="profile">
                  <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
                  <span><Skeleton style={{ marginLeft: '10px' }} containerClassName="skeleton" inline={true} width="200px" height="24px" /></span>
                </div>
              </td>
              <td className="second">
                <Skeleton containerClassName="skeleton" inline={true} width="160px" />
              </td>
              <td className="third">
                <Skeleton containerClassName="skeleton" inline={true} width="60px" />
              </td>
              <td className="four">
                <Skeleton containerClassName="skeleton" inline={true} width="160px" />
              </td>
              <td className="five">
                <Skeleton containerClassName="skeleton" inline={true} width="60px" />
              </td>
              <td>
                <Link to="#"><Skeleton containerClassName="skeleton" inline={true} width="20px" /></Link>
              </td>
            </tr>
          );
        })
      }
    </>
  };

  return (
    (lesson)
      ? <>
        <div className="lesson-homework-submitted-list">
          <Table responsive className="list-table">
            <thead>
              {(homeworkList.length) ?
                <tr>
                  <th className="first">Pupil Name</th>
                  <th className="second">Class Group</th>
                  <th className="third">Submitted</th>
                  <th className="four">Submission Date</th>
                  <th className="five">Marked</th>
                  {(isEdit) ? <th></th> : null}
                </tr>
                : null
              }

            </thead>
            <tbody>
              {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
              {(error) ? <tr><td colSpan={6} style={{ width: '100%' }}>{error}</td></tr> : null}
              {
                (!loading && !error && (homeworkList && homeworkList.length === 0))
                  ? <tr><td colSpan={6} style={{ width: '100%' }}>
                    <div className="app-empty-screen">
                      <div className="app-empty-icon">
                        <Image src={ImgNoUser} alt="Not record found" />
                      </div>
                      <div className="app-empty-content">
                        <h3>No Homework</h3>
                        {/* <p>Take it easy and enjoy a break</p> */}
                      </div>
                    </div>
                  </td></tr>
                  : null
              }
              {
                (!error && (homeworkList && homeworkList.length))
                  ? (
                    homeworkList.map((homework, i) => {
                      return (
                        <tr key={i}>
                          <td className="first">
                            <div className="profile">
                              <Image domain="server" src={homework.ProfilePicture} alt={homework.PupilName} />
                              <span>{homework.PupilName}</span>
                            </div>
                          </td>
                          <td className="second">
                            {homework.GroupName}
                          </td>
                          <td className={"third submited " + (homework.Submited ? 'yes' : 'no')}>
                            {(homework.Submited) ? 'Yes' : 'No'}
                          </td>
                          <td className="four">
                            {(homework.SubmitedDate) ? moment(homework.SubmitedDate).format('DD/MM/YYYY') : null}
                          </td>
                          <td className={"five marked " + (homework.Marked ? 'yes' : 'no')}>
                            {(homework.Marked) ? 'Yes' : 'No'}
                          </td>
                          {(isEdit) ? <td className="text-center">
                            <Link
                              to={"/lesson/home-work-submitted-detail/" + homework.LessonId + "/" + homework.PupilId}
                              state={{ returnTo: '/lesson/detail/' + homework.LessonId }}><FaAngleRight /></Link>
                          </td> : null}
                        </tr>
                      );
                    })
                  )
                  : null
              }
              {(isScroll && nextPage) ? <LoadingSkeleton row={5} /> : null}
            </tbody>
          </Table>
        </div>
      </>
      : null
  );
}

SubmittedList.propTypes = {
  utype: PropTypes.string.isRequired,
  lesson: PropTypes.object.isRequired,
  searchList: PropTypes.object.isRequired
};

export default SubmittedList;
