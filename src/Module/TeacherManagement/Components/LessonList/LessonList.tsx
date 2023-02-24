import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInfiniteScroll, useStateMounted } from '../../../../Core/Hooks';
import Skeleton from 'react-loading-skeleton';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import moment from 'moment';
import { Teacher } from '../../../../Services/TeacherService';
import { Lesson, LessonService } from '../../../../Services/LessonService';
import './LessonList.scss';

type LessonListProps = {
  utype?: string;
  teacher: Teacher;
  returnTo?: string;
}

function LessonList(props: LessonListProps) {

  const { teacher, returnTo } = props;

  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>();
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [lessons, setLessons] = useStateMounted<Lesson[]>([]);
  const lessonService = new LessonService();

  useEffect(() => {
    setSearch({ limit: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  useEffect(() => {
    (async () => {
      if (search) {
        await getLessons(teacher.TeacherId, search);
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


  const getLessons = async (teacherID, search) => {
    setLoading(true);
    setError(null);
    await lessonService.getAll(teacherID, search)
      .then((res) => {
        setLessons((prevHomework) => {
          return [...prevHomework, ...res.lessons];
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
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
            </tr>
          );
        })
      }
    </>
  };

  return (
    (teacher)
      ? <>
        <div className="teacher-lesson-submitted-list">
          <Table responsive className="list-table">
            <thead>
              <tr>
                <th></th>
                <th>Subject</th>
                <th>Lesson Topic</th>
                <th>Date</th>
                <th>Group</th>
                <th>Live Lesson</th>
                <th>Published </th>
                <th>Homework</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
              {(error) ? <tr><td colSpan={9} style={{ width: '100%' }}>{error}</td></tr> : null}
              {
                (!loading && !error && (lessons && lessons.length === 0))
                  ? <tr><td colSpan={9} style={{ width: '100%' }}>Not record found</td></tr>
                  : null
              }
              {
                (!error && (lessons && lessons.length))
                  ? (
                    lessons.map((lesson, i) => {
                      return (
                        <tr key={i}>
                          <td><span className="color-code" style={{ backgroundColor: lesson.SubjectColor }}></span></td>
                          <td>{lesson.SubjectName}</td>
                          <td>{lesson.LessonTopic}</td>
                          <td>{moment(lesson.Date).format('DD/MM/YYYY')}</td>
                          <td>{lesson.GroupName}</td>
                          <td className={(lesson.LiveSession) ? 'yes' : 'no'}>{(lesson.LiveSession) ? 'Yes' : 'No'}</td>
                          <td className={(lesson.Publish) ? 'yes' : 'no'}>{(lesson.Publish) ? 'Yes' : 'No'}</td>
                          <td className={(lesson.homeWork) ? 'yes' : 'no'}>{(lesson.homeWork) ? 'Yes' : 'No'}</td>
                          <td>
                            <Link
                              to={"/lesson/detail/" + lesson.id}
                              state={{ returnTo: returnTo }}><FaAngleRight /></Link>
                          </td>
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

LessonList.propTypes = {
  utype: PropTypes.string,
  teacher: PropTypes.object.isRequired,
  returnTo: PropTypes.string
};

export default LessonList;
