import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Row, Button, Spinner, ToastContainer, Toast } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Storage } from '../../Core/Services/StorageService';
import { Platform } from '../../Core/Utility';
import { useAuth } from '../../Core/Providers/AuthProvider';
import { LoginParam, UserService } from '../../Services/UserService';
import { QuickBlox } from '../../Services/QuickBloxService';
import { IoMdArrowBack } from "react-icons/io";
import './Login.scss';

type LoginProps = {};

type LoginFromProps = {
  utype: string;
};

function LoginFrom(props: LoginFromProps) {

  const utype: string = props.utype;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showError, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: any })?.from?.pathname || "/";
  const userService = new UserService();
  const auth = useAuth();
  const EMAIL_REGEX: any = process.env.REACT_APP_EMAIL_REGEX || '';

  const onPasswordVisiblity = () => {
    setShowPassword(!showPassword);
  };

  const qbUserSetup = (user) => {
    const qbUser = (u) => {
      const qbParams = {
        login: u.Email,
        password: u.getPassword(),
        email: u.Email,
        full_name: u.FullName,
        tag_list: u.roomId,
      };
      if (!u.QBUserId) {
        QuickBlox.createUser(qbParams, async (e, r) => {
          if (!e) {
            const params = {
              UserId: u.id,
              QBUserId: r.id
            }
            await userService.setQuickBloxID(params)
              .then((res) => {
                u.setQbUserID(r.id);
                // Auth Set User
                auth.setUser(u)
                  .then(() => { })
                  .catch(() => { });
              });
            const qbLoginParam = {
              login: qbParams.login,
              password: qbParams.password
            };
            QuickBlox.login(qbLoginParam, () => { });
          }
        });
      } else {
        const qbLoginParam = {
          login: qbParams.login,
          password: qbParams.password
        };
        QuickBlox.login(qbLoginParam, () => { });
      }
    };

    if (QuickBlox.session) {
      qbUser(user);
    } else {
      QuickBlox.setup((e, r) => {
        if (!e) { qbUser(user); }
      });
    }

  }
  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    let userTypeID: string | number = '';
    await userService.userType()
      .then(async (utypes) => {
        userTypeID = await utypes.filter((ut) => (ut.Type === utype))[0].id;
      })
      .catch(() => { });
    Storage.delete('rememberMe');
    if (values.rememberMe) {
      Storage.set('rememberMe', values.email);
    }
    const params: LoginParam = {
      Email: values.email,
      Password: values.password,
      PushToken: "",
      Device: "WEB",
      OS: Platform.OS(),
      AccessedVia: "WEB",
      UserType: userTypeID
    };
    await userService.login(params)
      .then((res) => {
        res.setPassword(values.password);
        // QuickBlox User Setup
        qbUserSetup(res);
        // Auth Set User
        auth.setUser(res)
          .then(() => {
            navigate(from, { replace: true });
          }).catch(() => { });
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
      email: remember,
      password: '',
      rememberMe: (remember) ? true : false
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      email: yup.string()
        .required('Please enter email')
        .matches(EMAIL_REGEX, 'Please provide a valid email'),
      password: yup.string()
        .required('Please enter password')
        .min(5, 'Password must contains at least five characters')
    }),
    initialValues: getInitialValues(),
    onSubmit: onSubmit
  };

  return (
    <>
      <Helmet>
        {(utype === 'school') ? <title>School Login</title> : null}
        {(utype === 'teacher') ? <title>Teacher Login</title> : null}
        {(utype === 'pupil') ? <title>Pupil Login</title> : null}
      </Helmet>
      <ToastContainer className="p-3" position="top-center">
        <Toast onClose={() => setError(null)} bg="danger" show={!!showError} delay={3000} autohide>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{showError}</Toast.Body>
        </Toast>
      </ToastContainer>
      <div className={'app-login-from login-' + utype}>
        <Row>
          <Col lg={4} md={6} sm={12}>
            <div className={'login-banner banner-' + utype}>
              <div className="back-arrow">

                <Link to='/user-type'> <IoMdArrowBack /></Link>
              </div>
            </div>
          </Col>
          <Col lg={8} md={6} sm={12}>
            <div className="login-frm-wrapper">
              <div className="login-frm">
                <h2 className="title">
                  {(utype === 'school') ? 'School Login' : null}
                  {(utype === 'teacher') ? 'Teacher Login' : null}
                  {(utype === 'pupil') ? 'Pupil Login' : null}
                </h2>
                <Formik {...formlik}>
                  {({ handleSubmit, handleChange, touched, values, isSubmitting, errors }) => (
                    <Form onSubmit={handleSubmit}>
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
                        Login to Continue
                        {(isSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                      </Button>
                      {
                        (utype === 'pupil')
                          ? <p className="register-link">New to MyEd Open School? <Link to="/pupil-registration">Get Started</Link></p>
                          : null
                      }
                    </Form>
                  )}
                </Formik>
                {
                  (utype === 'school' || utype === 'teacher')
                    ?
                    <p className="mt-5 intro">
                      <span>You can’t create an account in the app.</span>
                      Head over to our website to register and come back <br />when you’ve made an account.
                    </p>
                    : null
                }
                {
                  (utype === 'pupil')
                    ?
                    <p className="mt-5 intro">
                      <span>Our Terms & Conditions and Privacy Policy</span>
                      By clicking ‘Login to continue’, I agree to <Link to="#">MyEd’s Terms</Link>, <br />and <Link to="#">Privacy Policy</Link>
                    </p>
                    : null
                }
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

LoginFrom.propTypes = {
  utype: PropTypes.string.isRequired
};

function Login(props: LoginProps) {

  const userType = (process.env.REACT_APP_MEMBER_TYPE || '').split('|');
  const { utype } = useParams();

  return (
    <>
      {
        (userType.includes(utype || ''))
          ? (
            <div className="app-login">
              <LoginFrom {...props} utype={utype || ''} />
            </div>
          )
          : <Navigate replace={true} to="/user-type" />
      }
    </>
  );
}

export default Login;
