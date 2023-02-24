import React, { useEffect, useRef } from 'react';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { useLayout } from '../../../../../../Core/Providers/LayoutProvider';
import { IoMdArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStateMounted, useDownload } from '../../../../../../Core/Hooks';
import { Image } from '../../../../../../Components';
import { Homework, HomeworkMarkedParam, HomeworkService } from '../../../../../../Services/HomeworkService';
import { Recording } from '../../../../../../Components/Popup';
import { Button, Col, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import ImgBronze from '../../../../../../Assets/Images/Svg/bronze-unselected.svg';
import ImgSilver from '../../../../../../Assets/Images/Svg/silver-unselected.svg';
import ImgGold from '../../../../../../Assets/Images/Svg/gold-unselected.svg';
import moment from 'moment';
import { GetUrl } from '../../../../../../Core/Utility/Function';
import { Formik } from 'formik';
import { ImCross } from 'react-icons/im';
import Player from '../../../../../../Components/Popup/Player';
import './Detail.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  homework: Homework | undefined;
  error: string | null;
  returnTo: string;
}

function Heading(props: HeadingProps) {

  const { loading, homework, error, returnTo } = props;

  if (!loading && homework) {
    return (
      <>
        <h2 className="header-title">
          <Link to={returnTo}><IoMdArrowBack /></Link>
          <Helmet>
            <title>
              {homework.SubjectName}
            </title>
          </Helmet>
          {homework.SubjectName}
        </h2>
      </>
    );
  }

  return (
    <>
      <h2 className="header-title">
        <Link to={returnTo}><IoMdArrowBack /></Link>
        {
          (error)
            ? 'Error'
            : (
              <><Skeleton containerClassName="skeleton" width={200} inline={true} /></>
            )
        }
      </h2>
    </>
  );
}

Heading.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  homework: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string
};

function Detail() {

  const lessonID: any = useParams().lessonID;
  const pupilID: any = useParams().pupilID;
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [isEdit, setIsEdit] = useStateMounted(false);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [homework, setHomework] = useStateMounted<Homework>();
  const [playerShow, setPlayerShow] = useStateMounted(false);
  const [playerContent, setPlayerContent] = useStateMounted<any>();
  const homeworkService = new HomeworkService();
  const formRef = useRef<HTMLFormElement>(null);
  const [dLoading, download, dFile] = useDownload();
  const layout = useLayout();

  const onFrmSubmit = (e) => {
    if (formRef.current) {
      if (typeof formRef.current.requestSubmit === 'function') {
        formRef.current.requestSubmit();
      } else {
        formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
  };

  useEffect(() => {
    if (homework) {
      setIsEdit((homework.Marked) ? false : true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homework]);

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
        returnTo={returnTo} />
    </>;

    const headerRight = <>
      {
        (loading && !homework)
          ? <>
            <Skeleton containerClassName="skeleton" width={170} inline={true} />
          </>
          : (isEdit && homework?.Submited) ? <>
            <Button variant='success' className='mr-1 save-btn'
              disabled={frmSubmitting}
              onClick={onFrmSubmit}>
              Save as Marked & Notify
              {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
            </Button>
          </>
            : null
      }
    </>;

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: 'homework-addedit-header app-inner'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, homework, error, returnTo, isEdit]);

  const getHomework = async () => {
    setLoading(true);
    setError(null);
    await homeworkService
      .getByLessonIDAndPupilID(lessonID, pupilID)
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

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setFrmSubmitting(true);

    const recordingList = values.RecordingList.filter((r) => r.isNew !== undefined)
      .map((r) => { return r.file; });

    const params: HomeworkMarkedParam = {
      recording: recordingList,
      Feedback: values.Feedback,
      Rewards: values.Rewards
    };
    const homeworkID: any = homework?.id;
    await homeworkService.markedHomework(homeworkID, pupilID, params)
      .then(async (res) => {
        navigate('/lesson/detail/' + res.LessonId, { replace: true, state: { returnTo: '/lesson' } });
      })
      .catch((e) => {
        if (e.type === 'client') {
          setShowError(e.message);
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });
    setFrmSubmitting(false);
  };

  const getInitialValues = () => {
    let recordingList: any = homework?.RecordingList || [];
    return {
      Marked: homework?.Marked || true,
      Feedback: homework?.Feedback,
      Rewards: homework?.Rewards || '',
      RecordingList: recordingList
    };
  };

  const formlik = () => {
    return {
      validationSchema: yup.object().shape({
        Feedback: yup.string().required('Please enter feedback review'),
        Rewards: yup.string().required('Select reward for homework')
      }),
      initialValues: getInitialValues(),
      enableReinitialize: (homework) ? true : false,
      onSubmit: onSubmit
    }
  };
  return (

    <div className="app-homework-detail homework-detail">
      {
        (homework)
          ? <>
            <ToastContainer className="p-3 position-fixed" position="top-center">
              <Toast
                onClose={() => { setShowError(null); }}
                bg="danger"
                show={!!showError}
                delay={3000} autohide>
                <Toast.Header closeButton={true}>
                  <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>
                  {showError}
                </Toast.Body>
              </Toast>
            </ToastContainer>
            <Formik {...formlik()}>
              {({ handleSubmit, handleChange, touched, values, setValues, isSubmitting, errors }) => (
                <Form ref={formRef} onSubmit={handleSubmit} className={(!isEdit) ? 'form-not-edit' : ''}>
                  <div className="profile-detail">
                    <div className="profile-name-thumb">
                      <div className="profile-thumb">
                        <Image domain='server' src={homework.ProfilePicture} alt={homework.PupilName} />
                      </div>
                      <div className="profile-name">
                        <h4>{homework.PupilName}</h4>
                        <p>Group: {homework.GroupName}</p>
                      </div>
                    </div>
                    <div className="submitted-status-date">
                      {
                        (homework.Marked)
                          ? <div className="status">Marked</div>
                          : null
                      }
                      <div className="homework-date">
                        <label>Homework Date</label>
                        <span>{moment(homework.DueDate).format('DD/MM/YYY')}</span>
                      </div>
                      <div className="submitted-date">
                        <label>Submitted On</label>
                        <span>{(homework.SubmitedDate) ? moment(homework.SubmitedDate).format('DD/MM/YYY') : <>&nbsp;</>}</span>
                      </div>
                    </div>
                  </div>
                  <div className="submitted-details">
                    <Row>
                      <Col lg={9} md={12}>
                        <div className="lesson-plan">
                          <Row className="mb-15">
                            <div className="lesson-description">
                              <label>Lesson Description</label>
                              <p>{homework.HomeworkDescription}</p>
                            </div>
                          </Row>
                          {
                            (homework.CheckList && homework.CheckList.length)
                              ? <>
                                <Row className="mb-15">
                                  <div className="lesson-class-detail">
                                    <label className="title-line"><span>Items your class may need</span></label>
                                    <ul>
                                      {
                                        homework.CheckList.map((check, i) => {
                                          return (
                                            <li key={i}>
                                              <Form.Group className="checklist">
                                                <Form.Check defaultChecked={check.IsCheck} type="checkbox" label={check.ItemName} />
                                              </Form.Group>
                                            </li>
                                          );
                                        })
                                      }
                                    </ul>
                                  </div>
                                </Row>
                              </>
                              : null
                          }
                        </div>
                      </Col>
                      <Col lg={3} md={12} className="lesson-rightbar">
                        <div className="learning-material homework-uploader">
                          <h2>Uploaded Homework</h2>
                          <ul className="learning-material-inner">
                            {
                              homework.HomeworkList.map((item, i) => {
                                const dObj = { url: GetUrl(item.filename, 'server'), filename: item.originalname }
                                return <li key={i} onClick={() => download(dObj)}>
                                  {(dLoading && (dFile && dFile.url === dObj.url))
                                    ? <Spinner animation='border' variant="primary" size="sm" />
                                    : <Link to="#">{item.originalname}</Link>
                                  }
                                </li>;
                              })
                            }
                          </ul>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <Row>
                    <Col lg={8} sm={12}>
                      <div className="feedback">
                        <Row>
                          <div className="lesson-description">
                            <label>Teacher’s Feedback</label>
                            <Form.Control as="textarea" placeholder="Leave feedback here"
                              disabled={!isEdit || isSubmitting}
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
                    <Col lg={4} sm={12}>
                      <div className="rewards">
                        <Row>
                          <div className="rewards-part">
                            <label>Instant rewards for homework</label>
                            <div className="reward-starts">
                              <ul>
                                <li>
                                  <Form.Check className="app-reward" id='bronze'>
                                    <Form.Check.Input
                                      value={'3'}
                                      checked={values.Rewards === '3'}
                                      onChange={handleChange}
                                      disabled={!isEdit || isSubmitting}
                                      name="Rewards" className="bronze" type="radio"></Form.Check.Input>
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
                                      defaultChecked={values.Rewards === '6'}
                                      onChange={handleChange}
                                      disabled={!isEdit || isSubmitting}
                                      name="Rewards" className="silver" type="radio"></Form.Check.Input>
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
                                      checked={values.Rewards === '9'}
                                      onChange={handleChange}
                                      disabled={!isEdit || isSubmitting}
                                      name="Rewards" className="gold" type="radio"></Form.Check.Input>
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
                          (errors.Rewards)
                            ? <>
                              <div className='invalid-feedback d-block'>{errors.Rewards}</div>
                            </>
                            : null
                        }
                      </div>
                    </Col>
                    <Col lg={12}>
                      <div className="footer-buttons">
                        {
                          values.RecordingList.map((item, i) => {
                            const title = (item.isNew !== undefined) ? item.filename : item.originalname;
                            return <Link key={i} to="#" onClick={() => {
                              setPlayerContent(item);
                              setPlayerShow(true);
                            }} className="video-data mr-1">
                              <Image src="/assets/images/svg/video-icon.svg" alt={title} />
                              {title}
                              <ImCross className="ml-1 text-danger" onClick={() => {
                                setValues((prevValues) => {
                                  prevValues.RecordingList.splice(i, 1);
                                  return prevValues;
                                })
                              }} />
                            </Link>;
                          })
                        }
                        {
                          (isEdit)
                            ? <>
                              <Recording getRecording={(recording) => {
                                setValues((prevValues) => {
                                  recording.file = new File([recording.content], `${recording.filename}.mp4`, { type: 'video/mp4' });
                                  prevValues.RecordingList.push({ ...recording, isNew: true });
                                  return prevValues;
                                });
                              }} />
                            </>
                            : null
                        }
                      </div>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
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
          : (loading)
            ? <>Loading...</>
            : null
      }
    </div >
  );
}

export default Detail;
