import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { InsertTeacherParam, Teacher, TeacherService } from '../../../../Services/TeacherService';
import { IoMdArrowBack } from 'react-icons/io';
import { FiEdit2 } from "react-icons/fi";
import { Image } from '../../../../Components';
import { Button, Col, Container, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { CommanService, TeachingYear, Title } from '../../../../Services/CommanService';
import { useAuth } from '../../../../Core/Providers';
import { UserService } from '../../../../Services/UserService';
import './AddEdit.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  teacher: Teacher | undefined;
  error: string | null;
  teacherID?: string;
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const { loading, teacher, error, returnTo } = props;

  if (!loading && teacher) {
    return <>
      <Helmet>
        <title>
          {teacher.FullName}
        </title>
      </Helmet>
      <h2 className="header-title">
        {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}

        {teacher.FullName}
      </h2>
    </>;
  }

  if ((loading || error) && !teacher) {
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
  }

  return <>
    <Helmet>
      <title>
        Add new teacher
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
      Add new teacher
    </h2>
  </>;
};

Heading.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  teacher: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
  teacherID: PropTypes.string,
};

function AddEdit() {

  const teacherID: any = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();
  const imgType = (process.env.REACT_APP_IMG_TYPE || '').split('|');
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [teacher, setTeacher] = useStateMounted<Teacher>();
  const [userTypeID, setUserTypeID] = useStateMounted<string | number>();
  const [titles, setTitles] = useStateMounted<Title[]>([]);
  const [teachingYears, setTeachingYears] = useStateMounted<TeachingYear[]>([]);
  const teacherService = new TeacherService();
  const commanService = new CommanService();
  const userService = new UserService();
  const layout = useLayout();
  const EMAIL_REGEX: any = process.env.REACT_APP_EMAIL_REGEX || '';
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAuth().user();

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
      await getUserTypes();
      await getTitles();
      await getTeachingYears();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        teacher={teacher}
        teacherID={teacherID}
        returnTo={returnTo}
      />
    </>;

    const headerRight = <>
      {
        (!loading && teacher)
          ? <>
            <Button
              variant='success' className='mr-1 save-btn'
              disabled={frmSubmitting}
              onClick={onFrmSubmit}>
              Update
              {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
            </Button>
          </>
          : (
            (loading && !teacher)
              ? <>
                <Skeleton containerClassName="skeleton" width={170} inline={true} />
              </>
              : <>
                <Button variant='success' className='mr-1 save-btn'
                  disabled={frmSubmitting}
                  onClick={onFrmSubmit}>
                  Send Invite
                  {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                </Button>
              </>
          )
      }
    </>;

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: 'teacher-addedit-header',
      mainContentClass: 'teacher-addedit-main',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, teacher, layout, teacherID, returnTo, formRef, frmSubmitting]);

  useEffect(() => {
    (async () => {
      if (teacherID) {
        await getTeacher();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherID])

  const getTeacher = async () => {
    setLoading(true);
    setError(null);
    await teacherService.get(teacherID)
      .then((res) => {
        setTeacher(res);
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

  const getUserTypes = async () => {
    await userService.userType()
      .then(async (utypes) => {
        const userTypeID = await utypes.filter((ut) => (ut.Type === 'teacher'))[0].id;
        setUserTypeID(userTypeID);
      })
      .catch((e) => { });
  };

  const getTitles = async () => {
    await commanService.getTitle()
      .then((res) => {
        setTitles(res);
      })
      .catch((e) => { });
  };

  const getTeachingYears = async () => {
    await commanService.getTeachingYear()
      .then((res) => {
        setTeachingYears(res);
      })
      .catch((e) => { });
  };

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    setSubmitting(true);
    setFrmSubmitting(true);
    let callback;
    const params: InsertTeacherParam = {
      SchoolId: values.SchoolId,
      Title: values.Title,
      TeachingYear: values.TeachingYear,
      FirstName: values.FirstName,
      LastName: values.LastName,
      Email: values.Email,
      UniqueNumber: values.UniqueNumber,
      UserTypeId: values.UserTypeId,
      CreatedBy: values.CreatedBy,
      IsInvited: values.IsInvited,
    };
    if (teacher?.TeacherId) {
      callback = teacherService.update(teacher.TeacherId, params);
    } else {
      callback = teacherService.create(params);
    }
    await callback
      .then(async (res) => {
        if (values.ProfilePicture) {
          const tId = (teacher?.TeacherId) ? res.id : res.UserId;
          await teacherService.uploadProfile(tId, values.ProfilePicture)
            .then(() => navigate('/teacher-management'))
            .catch((e) => {
              if (e.type === 'client') {
                setShowError(e.message);
              } else {
                setShowError('System error occurred!! please try again.');
              }
            });
        } else {
          navigate('/teacher-management');
        }
      })
      .catch((e) => {
        if (e.type === 'client') {
          if (e.message.includes('Email')) {
            setFieldError('Email', e.message);
          } else {
            setShowError(e.message);
          }
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });
    setFrmSubmitting(false);
  };

  const getInitialValues = () => {
    const ProfilePicture: any = '';
    return {
      SchoolId: user?.UserDetialId || '',
      Title: teacher?.TitleId || '',
      TeachingYear: teacher?.TeachingYearId || '',
      FirstName: teacher?.FirstName || '',
      LastName: teacher?.LastName || '',
      Email: teacher?.Email || '',
      UniqueNumber: teacher?.UniqueNumber || '',
      UserTypeId: userTypeID || '',
      ProfilePicture: ProfilePicture,
      CreatedBy: user?.UserDetialId || '',
      IsInvited: (teacher?.TeacherId) ? true : false,
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      Title: yup.string()
        .required('Please select Title'),
      FirstName: yup.string()
        .required('Please enter First Name'),
      LastName: yup.string()
        .required('Please enter Last Name'),
      TeachingYear: yup.string()
        .required('Please select Teaching Year'),
      Email: yup.string()
        .required('Please enter email')
        .matches(EMAIL_REGEX, 'Please provide a valid email'),
      ProfilePicture: yup.mixed()
        .test('fileFormat', 'Invalid profile picture ', (value) => {
          if (!value) return true;
          return (value && imgType.includes(value.type));
        })
        .test('fileSize', 'Please upload valid profile picture', (value) => {
          if (!value) return true;
          return (value && value.size >= 20);
        })
    }),
    initialValues: getInitialValues(),
    enableReinitialize: true,
    onSubmit: onSubmit
  };

  return (
    <>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast onClose={() => setShowError(null)} bg="danger" show={!!showError} delay={3000} autohide>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{showError}</Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="app-teacher-addedit">
        <Formik {...formlik}>
          {({ handleSubmit, handleChange, touched, values, setFieldValue, isSubmitting, errors }) => (
            <Form ref={formRef} onSubmit={handleSubmit} >
              <div className="profile-banner">
                <div className="profile-pic">
                  {
                    (!errors.ProfilePicture && values.ProfilePicture)
                      ? <img aria-hidden src={URL.createObjectURL(values.ProfilePicture)} alt="Upload Profile Image" />
                      : (teacher)
                        ? <Image domain="server" src={teacher.ProfilePicture} alt={teacher.FullName} />
                        : <Image src="/assets/images/svg/teacher.svg" alt="Profile Image" />
                  }
                  <Form.Label htmlFor='ProfilePicture'>
                    <FiEdit2 className='edit-icon' />
                  </Form.Label>
                </div>
                <Form.Control
                  className='profile-pic-input'
                  id='ProfilePicture'
                  name='ProfilePicture'
                  type="file"
                  onChange={(e: any) => {
                    setFieldValue("ProfilePicture", e.currentTarget.files[0]);
                  }}
                  disabled={isSubmitting}
                  isValid={touched.ProfilePicture && !errors.ProfilePicture}
                  isInvalid={!!errors.ProfilePicture} />
              </div>
              <Container>
                <div className='form-container'>
                  <div className="inner-container">
                    <Row>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-4" controlId='Title'>
                          <Form.Label>Title</Form.Label>
                          <Form.Select
                            disabled={isSubmitting}
                            name="Title"
                            onChange={handleChange}
                            value={values.Title}
                            isValid={touched.Title && !errors.Title}
                            isInvalid={!!errors.Title}>
                            <option value="">Select Title</option>
                            {
                              titles.map((title, i) => {
                                return (
                                  <option key={i} value={title.id}>{title.Title}</option>
                                )
                              })
                            }
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors.Title}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="FirstName">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="text"
                            name="FirstName"
                            onChange={handleChange}
                            value={values.FirstName}
                            isValid={touched.FirstName && !errors.FirstName}
                            isInvalid={!!errors.FirstName} />
                          <Form.Control.Feedback type="invalid">{errors.FirstName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="LastName">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="text"
                            name="LastName"
                            onChange={handleChange}
                            value={values.LastName}
                            isValid={touched.LastName && !errors.LastName}
                            isInvalid={!!errors.LastName} />
                          <Form.Control.Feedback type="invalid">{errors.LastName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-4" controlId='TeachingYear'>
                          <Form.Label>Teaching Year</Form.Label>
                          <Form.Select
                            disabled={isSubmitting}
                            name="TeachingYear"
                            onChange={handleChange}
                            value={values.TeachingYear}
                            isValid={touched.TeachingYear && !errors.TeachingYear}
                            isInvalid={!!errors.TeachingYear}>
                            <option value="">Select Teaching Year</option>
                            {
                              teachingYears.map((teachingYear, i) => {
                                return (
                                  <option key={i} value={teachingYear.id}>{teachingYear.Title}</option>
                                )
                              })
                            }
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors.TeachingYear}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="UniqueNumber">
                          <Form.Label>Unique I.D (auto-generated)</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="text"
                            readOnly={true}
                            onChange={handleChange}
                            value={values.UniqueNumber}
                            isValid={touched.UniqueNumber && !errors.UniqueNumber}
                            isInvalid={!!errors.UniqueNumber} />
                          <Form.Control.Feedback type="invalid">{errors.UniqueNumber}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="Email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="Email"
                            onChange={handleChange}
                            value={values.Email}
                            isValid={touched.Email && !errors.Email}
                            isInvalid={!!errors.Email} />
                          <Form.Control.Feedback type="invalid">{errors.Email}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Container>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default AddEdit;
