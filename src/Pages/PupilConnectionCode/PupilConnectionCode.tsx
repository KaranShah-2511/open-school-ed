import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Button, Col, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useStateMounted } from '../../Core/Hooks';
import './PupilConnectionCode.scss';
import { PupilAddSchoolParam, PupilService } from '../../Services/PupilService';

function PupilConnectionCode() {

  const pID: any = useParams().id || '';
  const navigate = useNavigate();
  const [showError, setError] = useStateMounted<string | null>(null);
  const pupilService = new PupilService();

  const getInitialValues = () => {
    return {
      pupilId: pID,
      SchoolCode: ''
    };
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    const params: PupilAddSchoolParam = {
      pupilId: values.pupilId,
      SchoolCode: values.SchoolCode
    };
    await pupilService.pupilAddSchoolCode(params)
      .then((res) => {
        navigate('/login/pupil', { replace: true });
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      });
  };

  const formlik = {
    validationSchema: yup.object().shape({
      SchoolCode: yup.string()
        .required('Please enter a valid Code.')
    }),
    initialValues: getInitialValues(),
    onSubmit: onSubmit
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
      <div className="app-pupil-connection-code">
        <Row>
          <Col lg={4} md={6} sm={12}>
            <div className="banner"></div>
          </Col>
          <Col lg={8} md={6} sm={12}>
            <div className="content-area">
              <div>
                <h2 className="title">Connect to your school</h2>
                <p>To access classes at your school enter the unique code <br />provided by your school</p>
                <Formik {...formlik}>
                  {({ handleSubmit, handleChange, touched, values, isSubmitting, errors }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          name="SchoolCode"
                          type="text"
                          placeholder="Enter code"
                          onChange={handleChange}
                          value={values.SchoolCode}
                          isValid={touched.SchoolCode && !errors.SchoolCode}
                          isInvalid={!!errors.SchoolCode} />
                        <Form.Control.Feedback type="invalid">{errors.SchoolCode}</Form.Control.Feedback>
                      </Form.Group>
                      <div className="mt-50">
                        <Button variant="success" type="submit" disabled={isSubmitting}>
                          Submit my code
                          {(isSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                        </Button>
                        {/* <Button variant="outline" className="ml-1" type="button" disabled={isSubmitting}>Skip this step</Button> */}
                      </div>
                    </Form>
                  )}
                </Formik>
                <p className="mt-100 intro">You can connect to a school in the parent zone at any <br />time by adding the code teachers provide.</p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PupilConnectionCode;
