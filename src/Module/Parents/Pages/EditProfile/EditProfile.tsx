import React, { useEffect, useRef } from 'react'
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useNavigate } from 'react-router';
import { useStateMounted } from '../../../../Core/Hooks';
import { Children } from '../../../../Services/UserService';
import { Image } from '../../../../Components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { DatePicker } from 'react-nice-dates';
import { enGB } from 'date-fns/locale';
import { Button, Col, Container, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import moment from 'moment';
import { FiEdit2 } from "react-icons/fi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { ChildrenParam, ParentService } from '../../../../Services/ParentService';
import { PupilService } from '../../../../Services/PupilService';
import './EditProfile.scss';

function EditProfile() {
  const [myPupil, setPupil] = useStateMounted<Children>();
  const formRef = useRef<HTMLFormElement>(null);
  const EMAIL_REGEX: any = process.env.REACT_APP_EMAIL_REGEX || '';
  const imgType = (process.env.REACT_APP_IMG_TYPE || '').split('|');
  const user = useAuth().user();
  const [showPinPassword, setShowPinPassword] = useStateMounted<boolean>(false);
  const [showPassword, setShowPassword] = useStateMounted<boolean>(false);
  const parentService = new ParentService();
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const navigate = useNavigate();
  const pupilService = new PupilService();


  const onPinPasswordVisiblity = () => {
    setShowPinPassword(!showPinPassword);
  };

  const onPasswordVisiblity = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (user.activeParentZone) {
      if (myPupil && user.activeParentZone.id !== myPupil.id) {
        setPupil(user.activeParentZone);
      }
      if (!myPupil) {
        setPupil(user.activeParentZone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    //ChildrenParam
    const payload: ChildrenParam = {
      FirstName: values.FirstName,
      LastName: values.LastName,
      ParentFirstName: values.ParentFirstName,
      ParentLastName: values.ParentLastName,
      ParentFullName: values.ParentFullName,
      Dob: moment(values.Dob).format('YYYY-MM-DD'),
      Note: values.Note,
      Relationship: values.Relationship,
      AddressLine1: values.AddressLine1,
      AddressLine2: values.AddressLine2,
      City: values.City,
      PostCode: values.PostCode,
      MobileNumber: values.MobileNumber,
      PinPassword: values.PinPassword,
      UpdatedBy: "",
      Password: values.Password,
      UniqueNumber: values.UniqueNumber,
      Email: values.Email,
    };
    const pupilId: any = myPupil?.Pupilid;
    await parentService.updatePupil(pupilId, payload)

      .then(async (res) => {
        if (values.ProfilePicture) {
          await pupilService.uploadProfile(pupilId, values.ProfilePicture)
            .then(() => navigate('/parents/zone/profile', { replace: true }))
            .catch((e) => {
              if (e.type === 'client') {
                setShowError(e.message);
              } else {
                setShowError('System error occurred!! please try again.');
              }
            });
        } else {
          navigate('/parents/zone/profile', { replace: true });
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

  }

  const getInitialValues = () => {
    const ProfilePicture: any = '';
    const date: any = (myPupil) ? moment(myPupil.Dob).toDate() : undefined;

    return {
      FirstName: myPupil?.FirstName || "",
      LastName: myPupil?.LastName || "",
      ParentFirstName: myPupil?.ParentFirstName || "",
      ParentLastName: myPupil?.ParentLastName || "",
      ParentFullName: user.activeParentZone?.parentFullName || "",
      Dob: date,
      Note: myPupil?.Note || "",
      Relationship: myPupil?.Relationship || "",
      AddressLine1: myPupil?.AddressLine1 || "",
      AddressLine2: myPupil?.AddressLine2 || "",
      City: myPupil?.City || "",
      PostCode: myPupil?.PostCode || "",
      MobileNumber: myPupil?.MobileNumber || '',
      PinPassword: myPupil?.PinPassword || '',
      UpdatedBy: "",
      Password: "",
      ProfilePicture: ProfilePicture,
      UniqueNumber: myPupil?.UniqueNumber,
      Email: myPupil?.Email || "",
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
      Note: yup.string().required('Enter Note'),
      ParentFirstName: yup.string()
        .required('Please enter First Name'),
      ParentLastName: yup.string()
        .required('Please enter Last Name'),
      ParentFullName: yup.string()
        .required('Please enter Full Name'),
      Email: yup.string()
        .required('Please enter email')
        .matches(EMAIL_REGEX, 'Please provide a valid email'),
      MobileNumber: yup.string()
        .required('Please enter Mobile Number'),
      Relationship: yup.string()
        .required('Enter Relationship'),
      AddressLine1: yup.string()
        .required('Enter Address Line 1'),
      AddressLine2: yup.string()
        .required('Enter Address Line 2'),
      City: yup.string()
        .required('Enter City'),
      PostCode: yup.string()
        .required('Enter PostCode'),
      PinPassword: yup.string().length(4)
        .required('Enter forur digit code'),
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
      {
        (myPupil)
          ? <>
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
                    <div className='pupil-profile-view'>
                      <div className="profile-banner">
                        <div className="profile-pic">
                          {
                            (!errors.ProfilePicture && values.ProfilePicture)
                              ? <img aria-hidden src={URL.createObjectURL(values.ProfilePicture)} alt="Upload Profile Image" />
                              : (myPupil)
                                ? <Image domain="server" src={myPupil.ProfilePicture} alt={myPupil.FullName} />
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
                      <div className="edit-profile">
                        <Button
                          className="btn btn-success" type="submit" disabled={isSubmitting}>Update Profile
                          {(isSubmitting) ? <Spinner className="ml-1 spinner" animation="border" size="sm" /> : null}
                        </Button>
                      </div>
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
                          <Row>
                            <Col>
                              <Form.Group className="mb-3" controlId="Note">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  as="textarea"
                                  name="Note"
                                  onChange={handleChange}
                                  value={values.Note}
                                  isValid={touched.Note && !errors.Note}
                                  isInvalid={!!errors.Note} />
                                <Form.Control.Feedback type="invalid">{errors.Note}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>

                        <div className='inner-container'>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="Relationship">
                                <Form.Label>Relationship</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="Relationship"
                                  onChange={handleChange}
                                  value={values.Relationship}
                                  isValid={touched.Relationship && !errors.Relationship}
                                  isInvalid={!!errors.Relationship} />
                                <Form.Control.Feedback type="invalid">{errors.Relationship}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>

                          </Row>

                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="ParentFirstName">
                                <Form.Label>Parent First Name</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="ParentFirstName"
                                  onChange={handleChange}
                                  value={values.ParentFirstName}
                                  isValid={touched.ParentFirstName && !errors.ParentFirstName}
                                  isInvalid={!!errors.ParentFirstName} />
                                <Form.Control.Feedback type="invalid">
                                  {errors.ParentFirstName}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="ParentLastName">
                                <Form.Label>Parent Last Name</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="ParentLastName"
                                  onChange={handleChange}
                                  value={values.ParentLastName}
                                  isValid={touched.ParentLastName && !errors.ParentLastName}
                                  isInvalid={!!errors.ParentLastName} />
                                <Form.Control.Feedback type="invalid">
                                  {errors.ParentLastName}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>

                          </Row>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="MobileNumber">
                                <Form.Label>MobileNumber</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="MobileNumber"
                                  onChange={handleChange}
                                  value={values.MobileNumber}
                                  isValid={touched.MobileNumber && !errors.MobileNumber}
                                  isInvalid={!!errors.MobileNumber} />
                                <Form.Control.Feedback type="invalid">{errors.MobileNumber}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="PinPassword">
                                <Form.Label>PinPassword</Form.Label>
                                <div className="password-field">
                                  <Form.Control
                                    disabled={isSubmitting}
                                    type={showPinPassword ? "text" : "password"}
                                    name="PinPassword"
                                    onChange={handleChange}
                                    value={values.PinPassword}
                                    isValid={touched.PinPassword && !errors.PinPassword}
                                    isInvalid={!!errors.PinPassword}
                                  />

                                  <Form.Control.Feedback type="invalid">{errors.PinPassword}</Form.Control.Feedback>
                                  <span className="toggler" onClick={onPinPasswordVisiblity}>
                                    {
                                      showPinPassword ? <BsEyeSlash className="close" /> : <BsEye className="open" />
                                    }
                                  </span>
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="Email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="Email"
                                  onChange={handleChange}
                                  value={values.Email}
                                  isValid={touched.Email && !errors.Email}
                                  isInvalid={!!errors.Email} />
                                <Form.Control.Feedback type="invalid">{errors.Email}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="Password">
                                <Form.Label>Password</Form.Label>
                                <div className="password-field">
                                  <Form.Control
                                    disabled={isSubmitting}
                                    type={showPassword ? "text" : "password"}
                                    name="Password"
                                    onChange={handleChange}
                                    value={values.Password}
                                    isValid={touched.Password && !errors.Password}
                                    isInvalid={!!errors.Password}
                                  />

                                  <Form.Control.Feedback type="invalid">{errors.Password}</Form.Control.Feedback>
                                  <span className="toggler" onClick={onPasswordVisiblity}>
                                    {
                                      showPassword ? <BsEyeSlash className="close" /> : <BsEye className="open" />
                                    }
                                  </span>
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="AddressLine1">
                                <Form.Label>AddressLine 1</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="AddressLine1"
                                  onChange={handleChange}
                                  value={values.AddressLine1}
                                  isValid={touched.AddressLine1 && !errors.AddressLine1}
                                  isInvalid={!!errors.AddressLine1} />
                                <Form.Control.Feedback type="invalid">{errors.AddressLine1}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="AddressLine2">
                                <Form.Label>AddressLine 2</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="AddressLine2"
                                  onChange={handleChange}
                                  value={values.AddressLine2}
                                  isValid={touched.AddressLine2 && !errors.AddressLine2}
                                  isInvalid={!!errors.AddressLine2} />
                                <Form.Control.Feedback type="invalid">{errors.AddressLine2}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="City">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="City"
                                  onChange={handleChange}
                                  value={values.City}
                                  isValid={touched.City && !errors.City}
                                  isInvalid={!!errors.City} />
                                <Form.Control.Feedback type="invalid">{errors.City}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Form.Group className="mb-3" controlId="PostCode">
                                <Form.Label>PostCode</Form.Label>
                                <Form.Control
                                  disabled={isSubmitting}
                                  type="text"
                                  name="PostCode"
                                  onChange={handleChange}
                                  value={values.PostCode}
                                  isValid={touched.PostCode && !errors.PostCode}
                                  isInvalid={!!errors.PostCode} />
                                <Form.Control.Feedback type="invalid">{errors.PostCode}</Form.Control.Feedback>
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
          : null
      }
    </>
  )
}

export default EditProfile;
