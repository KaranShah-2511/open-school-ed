import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { useLayout } from '../../../../../../Core/Providers/LayoutProvider';
import { IoMdArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStateMounted } from '../../../../../../Core/Hooks';
import { Homework, HomeworkService } from '../../../../../../Services/HomeworkService';
import { useAuth } from '../../../../../../Core/Providers';
import SubmittedBookIcon from '../../../../../../Assets/Images/Svg/submitted-book.svg';
import MarkedBookIcon from '../../../../../../Assets/Images/Svg/marked-book.svg';
import SubmittedIcon from '../../../../../../Assets/Images/Svg/hw-submitted.svg';
import MarkedIcon from '../../../../../../Assets/Images/Svg/marked-icon.svg';
import { Col, Form, Row } from 'react-bootstrap';
import { Image } from '../../../../../../Components';
import './SubmittedMarked.scss';
import moment from 'moment';
import Player from '../../../../../../Components/Popup/Player';

type HeadingProps = {
  loading: boolean;
  homework: Homework | undefined;
  error: string | null;
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const { loading, homework, error, returnTo } = props;

  if (!loading && homework) {
    return <>
      <Helmet>
        <title>
          {homework.SubjectName}
        </title>
      </Helmet>
      <h2 className="header-title">
        {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
        {homework.SubjectName}
      </h2>
    </>;
  }

  return <>
    <Helmet>
      <title>
        {
          (error)
            ? 'Error'
            : 'Loading...'
        }
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
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
  loading: PropTypes.bool,
  homework: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string
};


function SubmittedMarked(props) {

  const lessonID: any = useParams().lid;
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [homework, setHomework] = useStateMounted<Homework>();
  const [playerShow, setPlayerShow] = useStateMounted(false);
  const [playerContent, setPlayerContent] = useStateMounted<any>();
  const homeworkService = new HomeworkService();
  const user = useAuth().user();
  const layout = useLayout();

  useEffect(() => {
    (async () => {
      await getHomework();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonID]);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        homework={homework}
        returnTo={returnTo}
      />
    </>;

    layout.clear().set({
      heading: heading,
      headerClass: 'header-pupil-homework-submitted-marked app-inner',
      mainContentClass: 'main-pupil-homework-submitted-marked',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, loading, homework, error, returnTo]);

  const getHomework = async () => {
    setLoading(true);
    setError(null);
    await homeworkService.getPupilHomework(lessonID, user.UserDetialId)
      .then((res) => {
        setHomework(res);
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
    <div className="app-homework-submitted-marked pupil-homework-submitted-marked">
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
        (!loading && !error && !homework)
          ? 'Not record found!'
          : null
      }
      {
        (!loading && !error && homework)
          ? <>
            <Row className='mb-30'>
              <Col lg={12} md={12} className={"pupil-top-submitted" + ((homework.Marked) ? ' marked' : '')}>
                <div className='submitted-wrap'>
                  {
                    (homework.Marked)
                      ? <>
                        <div className='title-icon'>
                          <h2>Homework has been marked!</h2>
                          <Image src={MarkedBookIcon} alt={homework.SubjectName} />
                        </div>
                      </>
                      : <>
                        <div className='title-icon'>
                          <h2>Homework submitted on time!</h2>
                          <Image src={SubmittedBookIcon} alt={homework.SubjectName} />
                        </div>
                      </>
                  }
                  <div className='date-submitted'>
                    <div className='submitted'>
                      {
                        (homework.Marked)
                          ? <><Image src={MarkedIcon} alt={homework.SubjectName} />
                            <span>Marked</span>
                          </>
                          : <>
                            <Image src={SubmittedIcon} alt={homework.SubjectName} />
                            <span>Submitted</span>
                          </>
                      }
                    </div>
                    <div className='dates'>
                      <div className='date'>
                        <label>Homework Date</label>
                        <span>{moment(homework.HomeWorkDate).format('DD/MM/YYYY')}</span>
                      </div>
                      <div className='date'>
                        <label>Submitted On</label>
                        <span>{moment(homework.SubmitedDate).format('DD/MM/YYYY')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={9} md={12} className="pupil-hw-left mb-30">
                <div className="hw-homework-plan">
                  <Row className='mb-30'>
                    <div className="homework-description">
                      <label>Homework Description</label>
                      <p>{homework.HomeworkDescription}</p>
                    </div>
                  </Row>
                  <Row className='mb-30'>
                    <div className="homework-class-detail">
                      <ul>
                        {
                          (homework.CheckList)
                            ?
                            homework.CheckList.map((item, i) => {
                              return <li key={i}>
                                <Form.Group className="checklist" controlId={"checklist-" + i}>
                                  <Form.Check type="checkbox" defaultChecked={item.IsCheck} label={item.ItemName} />
                                </Form.Group>
                              </li>
                            })
                            : null
                        }
                      </ul>
                    </div>
                  </Row>
                </div>
              </Col>
              <Col lg={3} md={12} className="mb-30">
                <div className='pupil-hw-right'>
                  <div className="learning-homework">
                    <h2>Uploaded homework</h2>
                    <ul className="learning-homework-inner">
                      {
                        (homework.HomeworkList)
                          ? homework.HomeworkList.map((item, i) => {
                            const title = item.originalname;
                            return <li key={i}>
                              <Link to="#">{title}</Link>
                            </li>;
                          })
                          : null
                      }
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
            {
              (homework.Marked)
                ? <>
                  <Row className='teacher-feedback-area pt-4'>
                    <Col lg={8}>
                      <div className='teacher-feedback'>
                        <label>Teacher’s Feedback</label>
                        <p>{homework.Feedback}</p>
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className='teacher-feedback-recoding'>
                        {
                          homework.RecordingList.map((item, i) => {
                            return <Link key={i} to="#" onClick={() => {
                              setPlayerContent(item);
                              setPlayerShow(true);
                            }} className="video-data mr-1">
                              <Image src="/assets/images/svg/video-icon.svg" alt={item.originalname} />
                              {item.originalname}
                            </Link>;
                          })
                        }
                      </div>
                    </Col>
                  </Row>
                  {
                    (playerShow)
                      ? <Player
                        data={playerContent}
                        handleClose={() => {
                          setPlayerShow(false);
                          setPlayerContent(null);
                        }}
                        title={(playerContent.isNew) ? playerContent.filename : playerContent.originalname} />
                      : null
                  }
                </>
                : null
            }
          </> : null
      }
    </div>
  );
}

export default SubmittedMarked;
