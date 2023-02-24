import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router';
import { DatePicker } from 'react-nice-dates';
import { enGB } from 'date-fns/locale';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { InsertPupilParam, Pupil, PupilService } from '../../../../Services/PupilService';
import { IoMdArrowBack } from 'react-icons/io';
import { FiEdit2 } from "react-icons/fi";
import { Image } from '../../../../Components';
import Select from 'react-select';
import { Button, Col, Container, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../../../Core/Providers';
import { TeacherService } from '../../../../Services/TeacherService';
import moment from 'moment';
import { UserService } from '../../../../Services/UserService';
import './AddEdit.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  pupil: Pupil | undefined;
  error: string | null;
  pupilID?: string;
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const { loading, pupil, error, returnTo } = props;

  if (!loading && pupil) {
    return <>
      <Helmet>
        <title>
          {pupil.FullName}
        </title>
      </Helmet>
      <h2 className="header-title">
        {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
        {pupil.FullName}
      </h2>
    </>;
  }

  if ((loading || error) && !pupil) {
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
        Add new pupil
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
      Add new pupil
    </h2>
  </>;
};

Heading.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  pupil: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
  pupilID: PropTypes.string,
};

function AddEdit(props) {

  const pupilID: any = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();
  const imgType = (process.env.REACT_APP_IMG_TYPE || '').split('|');
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [pupil, setPupil] = useStateMounted<Pupil>();
  const [userTypeID, setUserTypeID] = useStateMounted<string | number>();
  const [teacherLoading, setTeacherLoading] = useStateMounted<boolean>(false);
  const [teachers, setTeachers] = useStateMounted<{ value: string | number, label: string }[]>([]);
  const pupilService = new PupilService();
  const teacherService = new TeacherService();
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
      await getTeachers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        pupil={pupil}
        pupilID={pupilID}
        returnTo={returnTo}
      />
    </>;

    const headerRight = <>
      {
        (!loading && pupil)
          ? <>
            <Button variant='success' className='mr-1 save-btn'
              disabled={frmSubmitting}
              onClick={onFrmSubmit}>
              Save Pupil
              {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
            </Button>
          </>
          : (
            (loading && !pupil)
              ? <>
                <Skeleton containerClassName="skeleton" width={170} inline={true} />
              </>
              : <>
                <Button variant='success' className='mr-1 save-btn'
                  disabled={frmSubmitting}
                  onClick={onFrmSubmit}>
                  Save Pupil
                  {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                </Button>
              </>
          )
      }
    </>;

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: 'pupil-addedit-header',
      mainContentClass: 'pupil-addedit-main',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, pupil, layout, pupilID, returnTo, formRef, frmSubmitting]);

  useEffect(() => {
    (async () => {
      if (pupilID) {
        await getPupil();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pupilID])

  const getPupil = async () => {
    setLoading(true);
    setError(null);
    await pupilService.get(pupilID)
      .then((res) => {
        setPupil(res);
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
        const userTypeID = await utypes.filter((ut) => (ut.Type === 'pupil'))[0].id;
        setUserTypeID(userTypeID);
      })
      .catch((e) => { });
  };

  const getTeachers = async () => {
    setTeacherLoading(true);
    await teacherService
      .getDropDownBySchoolID(user.UserDetialId)
      .then((res) => {
        const data = res.map((teacher) => {
          return {
            value: teacher.TeacherId,
            label: teacher.FullName
          };
        })
        setTeachers(data);
      })
      .catch((e) => { })
      .finally(() => {
        setTeacherLoading(false);
      });
  };

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    setSubmitting(true);
    setFrmSubmitting(false);
    let callback;
    let addTeacherList: any = [];
    let removeTeacherList: any = [];
    if (user.userType.Type !== 'teacher') {
      const allTeacherList = values.AddTeacherList.map((t) => { return { TeacherId: t.value }; });
      addTeacherList = (pupil?.TeacherList && pupil.TeacherList.length)
        ? allTeacherList.filter((t) => !(pupil?.TeacherList.filter((pt) => t.TeacherId === pt.TeacherId).length))
        : allTeacherList;
      removeTeacherList = (pupil?.TeacherList && pupil.TeacherList.length)
        ? pupil?.TeacherList
          .filter((t) => !(allTeacherList.filter((pt) => t.TeacherId === pt.TeacherId).length))
          .map((t) => { return { TeacherId: t.TeacherId }; })
        : [];
    } else if (!pupil) {
      addTeacherList = [{ TeacherId: user.id }];
    }

    const params: InsertPupilParam = {
      SchoolId: values.SchoolId,
      AddTeacherList: addTeacherList,
      RemoveTeacherList: removeTeacherList,
      ParentFirstName: values.ParentFirstName,
      ParentLastName: values.ParentLastName,
      FirstName: values.FirstName,
      LastName: values.LastName,
      Email: values.Email,
      MobileNumber: values.MobileNumber,
      Dob: moment(values.Dob).format('YYYY-MM-DD'),
      UserTypeId: values.UserTypeId,
      IsInvited: values.IsInvited,
      CreatedBy: values.CreatedBy,
      UniqueNumber: values.UniqueNumber,
    };
    if (pupil) {
      callback = pupilService.update(pupil.id, params);
    } else {
      callback = pupilService.create(params);
    }
    await callback
      .then(async (res) => {
        if (values.ProfilePicture) {
          const pId = (pupil) ? res.id : res.UserId;
          await pupilService.uploadProfile(pId, values.ProfilePicture)
            .then(() => navigate('/pupil-management'))
            .catch((e) => {
              if (e.type === 'client') {
                setShowError(e.message);
              } else {
                setShowError('System error occurred!! please try again.');
              }
            });
        } else {
          navigate('/pupil-management');
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
    const addTeacherList = (pupil?.TeacherList && pupil.TeacherList.length)
      ? teachers.filter((t) => pupil.TeacherList.filter((pt) => t.value === pt.TeacherId).length)
      : [];
    const date: any = (pupil?.Dob) ? moment(pupil.Dob).toDate() : undefined;
    const ProfilePicture: any = '';
    let SchoolId, CreatedBy;
    if (user.userType.Type === 'school') {
      SchoolId = user?.UserDetialId || '';
      CreatedBy = user?.UserDetialId || '';
    } else {
      SchoolId = user?.SchoolId || '';
      CreatedBy = user?.id || '';
    }
    return {
      SchoolId: SchoolId,
      FirstName: pupil?.FirstName || '',
      LastName: pupil?.LastName || '',
      AddTeacherList: addTeacherList || [],
      ParentFirstName: pupil?.ParentFirstName || '',
      ParentLastName: pupil?.ParentLastName || '',
      Email: pupil?.Email || '',
      MobileNumber: pupil?.MobileNumber || '',
      UserTypeId: userTypeID || '',
      ProfilePicture: ProfilePicture,
      Dob: date,
      IsInvited: (pupil) ? true : false,
      UniqueNumber: pupil?.UniqueNumber || '',
      CreatedBy: CreatedBy,
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      FirstName: yup.string()
        .required('Please enter First Name'),
      LastName: yup.string()
        .required('Please enter Last Name'),
      Dob: yup.date()
        .required('Please enter Date of Birth')
        .max(new Date(), 'Please select valid Date of Birth'),
      AddTeacherList: yup.array()
        .min(((user.userType.Type !== 'teacher') ? 1 : 0), 'Assign at least 1 teacher'),
      ParentFirstName: yup.string()
        .required('Please enter First Name'),
      ParentLastName: yup.string()
        .required('Please enter Last Name'),
      Email: yup.string()
        .required('Please enter email')
        .matches(EMAIL_REGEX, 'Please provide a valid email'),
      MobileNumber: yup.string()
        .required('Please enter Mobile Number'),
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
      <div className="app-pupil-addedit">
        <Formik {...formlik}>
          {({ handleSubmit, handleChange, touched, values, setFieldValue, setFieldTouched, isSubmitting, errors }) => (
            <Form ref={formRef} onSubmit={handleSubmit}>
              <div className="profile-banner">
                <div className="profile-pic">
                  {
                    (!errors.ProfilePicture && values.ProfilePicture)
                      ? <img aria-hidden src={URL.createObjectURL(values.ProfilePicture)} alt="Upload Profile Image" />
                      : (pupil)
                        ? <Image domain="server" src={pupil.ProfilePicture} alt={pupil.FullName} />
                        : <Image src="/assets/images/svg/pupil.svg" alt="Profile Image" />
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
                        <Form.Group className="mb-3" controlId="Dob">
                          <Form.Label>Date of Birth</Form.Label>
                          <DatePicker
                            date={values.Dob}
                            onDateChange={(d) => {
                              setFieldValue('Dob', d);
                            }}
                            locale={enGB}
                            format='dd/MM/yyyy'>
                            {
                              ({ inputProps, focused }) => (
                                <>
                                  <Form.Control
                                    disabled={isSubmitting}
                                    name="Dob"
                                    className={'date-picker-input input' + (focused ? '-focused' : '')}
                                    {...inputProps}
                                    isValid={touched.Dob && !errors.Dob}
                                    isInvalid={!!errors.Dob}
                                  />
                                </>
                              )
                            }
                          </DatePicker>
                          <Form.Control.Feedback
                            className={(errors.Dob) ? 'd-block' : ''}
                            type="invalid">{errors.Dob}</Form.Control.Feedback>
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
                    {
                      (user.userType.Type !== 'teacher')
                        ? <>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-4" controlId='add'>
                                <Form.Label>Assigned Teacher</Form.Label>
                                <Select
                                  closeMenuOnSelect={false}
                                  isMulti
                                  isDisabled={isSubmitting}
                                  isLoading={teacherLoading}
                                  onChange={(options) => setFieldValue('AddTeacherList', options)}
                                  onBlur={() => setFieldTouched('AddTeacherList', true)}
                                  noOptionsMessage={() => "No teacher"}
                                  placeholder="Enter teacher name"
                                  options={teachers}
                                  value={values.AddTeacherList}
                                />
                                <Form.Control.Feedback
                                  className={(errors.AddTeacherList) ? 'd-block' : ''}
                                  type="invalid">{errors.AddTeacherList}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                        : null
                    }

                    <Row>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="ParentFirstName">
                          <Form.Label>Parent’s First Name</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="text"
                            name="ParentFirstName"
                            onChange={handleChange}
                            value={values.ParentFirstName}
                            isValid={touched.ParentFirstName && !errors.ParentFirstName}
                            isInvalid={!!errors.ParentFirstName} />
                          <Form.Control.Feedback type="invalid">{errors.ParentFirstName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="ParentLastName">
                          <Form.Label>Parent’s Last Name</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="text"
                            name="ParentLastName"
                            onChange={handleChange}
                            value={values.ParentLastName}
                            isValid={touched.ParentLastName && !errors.ParentLastName}
                            isInvalid={!!errors.ParentLastName} />
                          <Form.Control.Feedback type="invalid">{errors.ParentLastName}</Form.Control.Feedback>
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
                      <Col lg={6} sm={12}>
                        <Form.Group className="mb-3" controlId="MobileNumber">
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            disabled={isSubmitting}
                            type="tel"
                            onChange={handleChange}
                            value={values.MobileNumber}
                            isValid={touched.MobileNumber && !errors.MobileNumber}
                            isInvalid={!!errors.MobileNumber} />
                          <Form.Control.Feedback type="invalid">{errors.MobileNumber}</Form.Control.Feedback>
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
