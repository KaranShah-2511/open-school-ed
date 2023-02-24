import React, { useEffect, useRef } from 'react';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { useLayout } from '../../../../../../Core/Providers/LayoutProvider';
import { IoMdArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStateMounted } from '../../../../../../Core/Hooks';
import { Homework, HomeworkService } from '../../../../../../Services/HomeworkService';
import { useAuth } from '../../../../../../Core/Providers';
import { Button, Col, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { FieldArray, Formik } from 'formik';
import { Image } from '../../../../../../Components';
import MyCalendar from '../../../../../../Assets/Images/Svg/calendar-small-icon.svg';
import './Detail.scss';
import moment from 'moment';
import { ImCross } from 'react-icons/im';

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


function Detail(props) {

  const lessonID: any = useParams().lid;
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [homework, setHomework] = useStateMounted<Homework>();
  const [showSuccess, setShowSuccess] = useStateMounted<string | null>(null);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [homeworkError, setHomeworkError] = useStateMounted<string | null>(null);
  const homeworkService = new HomeworkService();
  const formRef = useRef<HTMLFormElement>(null);
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  // const [removeHomework, setRemoveHomework] = useStateMounted<any[]>([]);
  const user = useAuth().user();
  const layout = useLayout();
  const homeworkType = [
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv', 'application/pdf', 'image/jpg',
    'image/jpeg', 'image/png', 'image/gif'
  ];

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
    const headerRight = <>
      {
        (!loading && homework)
          ? (!error) ? <Button variant='success' className='mr-1 save-btn'
            disabled={frmSubmitting}
            onClick={onFrmSubmit}>
            Submit Homework {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
          </Button> : null
          : <Skeleton containerClassName="skeleton mr-1" width={200} inline={true} />
      }
    </>;

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: 'header-pupil-homework-detail app-inner',
      mainContentClass: 'main-pupil-homework-detail',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, loading, homework, error, returnTo]);

  const getHomework = async () => {
    setLoading(true);
    setError(null);
    await homeworkService.getPupilHomework(lessonID, user.UserDetialId)
      .then((res) => {
        // if (res.Marked || res.Submited) {
        //   navigate('/lesson/homework-submitted-marked/' + lessonID, { replace: true, state: { returnTo: '/lesson/detail/' + lessonID } });
        //   return;
        // }
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

  const uploadHomework = (e, values, setFieldValue) => {
    setHomeworkError(null);
    const homeworkSchema = yup.object().shape({
      homework: yup.mixed()
        .test('fileFormat', 'Invalid file, Upload valid csv, pdf, xls, doc and image', (value) => {
          return (value && homeworkType.includes(value.type));
        })
        .test('fileSize', 'Please upload valid file', (value) => {
          return (value && value.size >= 10);
        })
    });
    homeworkSchema.validate({ homework: e.target.files[0] })
      .then((res) => {
        const homeworkList = values.HomeworkList;
        homeworkList.push({
          file: e.target.files[0], filename: e.target.files[0].name, isNew: true
        });
        setFieldValue('HomeworkList', homeworkList);
      })
      .catch((error) => {
        setHomeworkError(error.message);
        setTimeout(() => setHomeworkError(null), 2000);
      })
      .finally(() => {
        e.target.value = "";
      });
  }

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setFrmSubmitting(true);
    // const removeMaterialList = removeHomework.map((m) => m.originalname);
    const materialList = values.HomeworkList.filter((m) => m.isNew !== undefined)
      .map((m) => { return m.file; });

    const params = {
      materiallist: materialList
    };

    const id: any = homework?.HomeWorkId;
    await homeworkService.uploadHomework(id, user.UserDetialId, params)
      .then((res) => {
        navigate('/lesson/homework-submitted-marked/' + lessonID, { replace: true, state: { returnTo: '/lesson/detail/' + lessonID } });
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
    const checkList: any = homework?.CheckList || [];
    const homeworkList: any = homework?.HomeworkList || [];
    return {
      HomeworkList: homeworkList,
      CheckList: checkList,
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      HomeworkList: yup.array()
        .min(1, 'Upload homework'),
    }),
    initialValues: getInitialValues(),
    enableReinitialize: false,
    onSubmit: onSubmit
  };

  return (
    <div className="app-homework-detail pupil-homework-detail">
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast
          onClose={() => { setShowError(null); setShowSuccess(null); }}
          bg={(showSuccess) ? 'success' : ((showError) ? 'danger' : '')}
          show={(!!showError || !!showSuccess)}
          delay={3000} autohide>
          {(showError) ? <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header> : null}
          <Toast.Body>
            {showError}
            {showSuccess}
          </Toast.Body>
        </Toast>
      </ToastContainer>
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
            <Formik {...formlik}>
              {({ handleSubmit, handleChange, values, setValues, setFieldValue, isSubmitting, errors }) => (
                <Form ref={formRef} onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={9} md={12} className="pupil-hw-left">
                      <div className="hw-homework-plan">
                        <div className="row">
                          <Col lg={3} md={6} className="homework-subject mb-30">
                            <label>Due date</label>
                            <p>
                              <Image src={MyCalendar} alt={homework.TeacherFullName} />
                              {moment(homework.DueDate).format('DD/MM/YYYY')}
                            </p>
                          </Col>
                          <Col lg={3} md={6} className="homework-topic mb-30">
                            <label>Teacher</label>
                            <p>
                              {(homework.TeacherProfile) ? <Image domain='server' src={homework.TeacherProfile} alt={homework.TeacherFullName} /> : null}
                              {homework.TeacherFullName}
                            </p>
                          </Col>
                        </div>
                        <Row className="mb-30">
                          <div className="homework-description">
                            <label>Homework Description</label>
                            <p>{homework.HomeworkDescription}</p>
                          </div>
                        </Row>
                        <FieldArray name="CheckList">
                          {
                            ({ push, remove }) => (
                              <>
                                <Row className="mb-30">
                                  <div className="homework-class-detail">
                                    <label className="title-line">Make sure you:</label>
                                    <ul>
                                      {
                                        values.CheckList.map((item, i) => {
                                          return <li key={i}>
                                            <Form.Group className="checklist" controlId={`CheckList-${i}`}>
                                              <Form.Check
                                                name={`CheckList.${i}.IsCheck`}
                                                type="checkbox"
                                                defaultChecked={item.IsCheck}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                label={item.ItemName} />
                                            </Form.Group>
                                          </li>;
                                        })
                                      }
                                    </ul>
                                  </div>
                                </Row>
                              </>
                            )
                          }
                        </FieldArray>
                      </div>
                    </Col>
                    <Col lg={3} md={12}>
                      <div className='pupil-hw-right'>
                        <div className="learning-homework">
                          <h2>Upload homework</h2>
                          <div className="app-fileuploader">
                            <Form.Control
                              name='Homework'
                              type="file"
                              onChange={(e: any) => {
                                uploadHomework(e, values, setFieldValue);
                              }}
                              isValid={!homeworkError}
                              isInvalid={!!homeworkError}
                              disabled={isSubmitting}
                            />
                            <Form.Control.Feedback type="invalid">{homeworkError}</Form.Control.Feedback>
                            {
                              (errors.HomeworkList && !homeworkError) ?
                                <Form.Control.Feedback className='d-block' type="invalid">{errors.HomeworkList}</Form.Control.Feedback>
                                : null
                            }
                          </div>
                          <ul className="learning-homework-inner">
                            {
                              values.HomeworkList.map((item, i) => {
                                const title = (item.isNew !== undefined) ? item.filename : item.originalname;
                                return <li key={i}>
                                  <Link to="#">{title}<ImCross onClick={() => {
                                    // if (item.isNew === undefined) {
                                    //   setRemoveHomework((prevHomework) => {
                                    //     prevHomework.push(item);
                                    //     return prevHomework;
                                    //   })
                                    // }
                                    setValues((prevValues) => {
                                      prevValues.HomeworkList.splice(i, 1);
                                      return prevValues;
                                    })
                                  }} /></Link>
                                </li>;
                              })
                            }
                          </ul>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </> : null
      }
    </div>
  );
}

export default Detail;
