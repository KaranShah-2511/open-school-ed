import React, { useState } from 'react';
import { Col, Form, Row, Button, Spinner, ToastContainer, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Formik } from 'formik';
import * as yup from 'yup';
import './PupilRegistration.scss';
import { Storage } from '../../Core/Services/StorageService';
import { UserService } from '../../Services/UserService';
import { PupilService, PupilRegisterParam } from '../../Services/PupilService';

function PupilRegistration() {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showError, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userService = new UserService();
  const pupilService = new PupilService();
  const EMAIL_REGEX: any = process.env.REACT_APP_EMAIL_REGEX || '';

  const onPasswordVisiblity = () => {
    setShowPassword(!showPassword);
  };

  const days = Array.from({ length: 31 }, (e, i) => {
    return { value: i + 1, text: i + 1 };
  });

  const months = Array.from({ length: 12 }, (e, i) => {
    const name = new Date(0, i + 1, 0).toLocaleDateString("en", { month: "long" });
    return { value: i + 1, text: name };
  });

  const years = Array.from({ length: 42 }, (e, i) => {
    const year = (new Date()).getFullYear() - i;
    return { value: year, text: year };
  });

  const onSubmitFrm = async (values, { setSubmitting }) => {
    setSubmitting(true);
    let userTypeID: string | number = '';
    await userService.userType()
      .then(async (utypes) => {
        userTypeID = await utypes.filter((ut) => (ut.Type === 'pupil'))[0].id;
      })
      .catch(() => { });
    Storage.delete('rememberMe');
    if (values.rememberMe) {
      Storage.set('rememberMe', values.email);
    }
    const params: PupilRegisterParam = {
      Dob: [values.year, values.month, values.day].join('-'),
      FirstName: values.firstName,
      LastName: values.lastName,
      Email: values.email,
      Password: values.password,
      UserType: userTypeID
    };
    await pupilService.pupilRegister(params)
      .then((res) => {
        navigate('/pupil-connection-code/' + res.UserDetialId, { replace: true });
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      });
  };

  const getInitialValues = () => {
    const remember = Storage.get('rememberMe') || '';
    return {
      day: '',
      month: '',
      year: '',
      firstName: '',
      lastName: '',
      email: remember,
      password: '',
      rememberMe: (remember) ? true : false
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      day: yup.string().required('Please select day'),
      month: yup.string().required('Please select month'),
      year: yup.string().required('Please select year'),
      firstName: yup.string().required('Please enter first name'),
      lastName: yup.string().required('Please enter last name'),
      email: yup.string()
        .required('Please enter email')
        .matches(EMAIL_REGEX, 'Please provide a valid email'),
      password: yup.string()
        .required('Please enter password')
        .min(5, 'Password must contains at least five characters')
    }),
    initialValues: getInitialValues(),
    onSubmit: onSubmitFrm
  };

  return (
    <>
      <Helmet>
        <title>Pupil Account</title>
      </Helmet>
      <ToastContainer className="p-3" position="top-center">
        <Toast onClose={() => setError(null)} bg="danger" show={!!showError} delay={3000} autohide>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{showError}</Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="app-pupil-registration">
        <Row>
          <Col lg={4} md={6} sm={12}>
            <div className="banner"></div>
          </Col>
          <Col lg={8} md={6} sm={12}>
            <div className="frm-wrapper">
              <div className="registration-frm">
                <span className="login-link w-100 text-right pull-right">
                  Already Registered? <Link to="/login/pupil">Login</Link>
                </span>
                <h2 className="title">Pupil Account</h2>
                <Formik {...formlik}>
                  {({ handleSubmit, handleChange, touched, values, isSubmitting, errors }) => (
                    <Form onSubmit={handleSubmit}>
                      <div>
                        <Form.Label>What is the learners date of birth?</Form.Label>
                        <Row>
                          <Col lg={4} md={12}>
                            <Form.Group controlId="day">
                              <Form.Select
                                className="mb-3"
                                onChange={handleChange}
                                value={values.day}
                                isValid={touched.day && !errors.day}
                                isInvalid={!!errors.day} >
                                <option value="">Day</option>
                                {
                                  days.map((day, i) => {
                                    return (
                                      <option key={i} value={day.value}>{day.text}</option>
                                    )
                                  })
                                }
                              </Form.Select>
                              <Form.Control.Feedback className="mb--3" type="invalid">{errors.day}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col lg={4} md={12}>
                            <Form.Group controlId="month">
                              <Form.Select
                                className="mb-3"
                                onChange={handleChange}
                                value={values.month}
                                isValid={touched.month && !errors.month}
                                isInvalid={!!errors.month} >
                                <option value="">Month</option>
                                {
                                  months.map((month, i) => {
                                    return (
                                      <option key={i} value={month.value}>{month.text}</option>
                                    )
                                  })
                                }
                              </Form.Select>
                              <Form.Control.Feedback className="mb--3" type="invalid">{errors.month}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col lg={4} md={12}>
                            <Form.Group controlId="year">
                              <Form.Select
                                className="mb-3"
                                onChange={handleChange}
                                value={values.year}
                                isValid={touched.year && !errors.year}
                                isInvalid={!!errors.year} >
                                <option value="">Year</option>
                                {
                                  years.map((year, i) => {
                                    return (
                                      <option key={i} value={year.value}>{year.text}</option>
                                    )
                                  })
                                }
                              </Form.Select>
                              <Form.Control.Feedback className="mb--3" type="invalid">{errors.year}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <Form.Label>What is the learners name</Form.Label>
                        <Row>
                          <Col lg={6} md={12}>
                            <Form.Group controlId="firstName">
                              <Form.Control
                                className="mb-3"
                                type="text"
                                placeholder="First Name"
                                onChange={handleChange}
                                value={values.firstName}
                                isValid={touched.firstName && !errors.firstName}
                                isInvalid={!!errors.firstName} />
                              <Form.Control.Feedback className="mb--3" type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col lg={6} md={12}>
                            <Form.Group controlId="lastName">
                              <Form.Control
                                className="mb-3"
                                type="text"
                                placeholder="Last Name"
                                onChange={handleChange}
                                value={values.lastName}
                                isValid={touched.lastName && !errors.lastName}
                                isInvalid={!!errors.lastName} />
                              <Form.Control.Feedback className="mb--3" type="invalid">{errors.lastName}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Enter email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Your email"
                          onChange={handleChange}
                          value={values.email}
                          isValid={touched.email && !errors.email}
                          isInvalid={!!errors.email} />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <div className="password-field">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Your Password"
                            onChange={handleChange}
                            value={values.password}
                            isValid={touched.password && !errors.password}
                            isInvalid={!!errors.password} />
                          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                          <span className="toggler" onClick={onPasswordVisiblity}>
                            {
                              showPassword ? <BsEyeSlash className="close" /> : <BsEye className="open" />
                            }
                          </span>
                        </div>
                      </Form.Group>
                      <Form.Group className="mb-5 forgot-check-box" controlId="rememberMe">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          onChange={handleChange}
                          checked={values.rememberMe} />
                        <span className="forgot-link"><Link to="#">Forgot password?</Link></span>
                      </Form.Group>
                      <Button variant="success" type="submit" disabled={isSubmitting}>
                        Create My Account
                        {(isSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                      </Button>
                    </Form>
                  )}
                </Formik>
                <p className="mt-5 intro">
                  <span>Our Terms & Conditions and Privacy Policy</span>
                  By clicking ‘Login to continue’, I agree to <Link to="#">MyEd’s Terms</Link>, <br />and <Link to="#">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PupilRegistration;
