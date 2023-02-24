import React, { useEffect } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { SchoolService, MySchoolDetail, SchoolDetailParam } from '../../../../Services/SchoolService';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Children } from '../../../../Services/UserService';
import './MySchool.scss';

function MySchool() {

  const [schoolDetails, setSchoolDetails] = useStateMounted<MySchoolDetail>();
  const [error, setError] = useStateMounted<string | null>(null);
  const [schoolData, setSchoolData] = useStateMounted<Children>();
  const schoolService = new SchoolService();
  const user = useAuth().user();

  useEffect(() => {
    if (user.activeParentZone) {
      if (schoolData && user.activeParentZone.id !== schoolData.id) {
        setSchoolData(user.activeParentZone);
      }
      if (!schoolData) {
        setSchoolData(user.activeParentZone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    getSchool();
  }, []);

  const getSchool = async () => {
    await schoolService.getSchoolDetail(user.SchoolId)
      .then(async (res) => {
        setSchoolDetails(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
  }

  const getInitialValues = () => {
    const schoolFullName = (schoolData?.SchoolFirstName)+ " " +(schoolData?.SchoolLastName)
    return {
      SchoolName: schoolFullName || "",
      UniqueLink: schoolDetails?.UniqueNumber || "",
      TeacherName: "",
      AddressLine1: schoolDetails?.AddressLine1 || "",
      AddressLine2: schoolDetails?.AddressLine2 || "",
      City: schoolDetails?.City || "",
      PostCode: schoolDetails?.PostCode || "",
      SchoolContactNo: schoolData?.SchoolMobileNumber || "",
    };
  };

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    //ChildrenParam
    const payload: SchoolDetailParam = {

      SchoolName: values.SchoolName,
      UniqueLink: values.UniqueLink,
      TeacherName: values.TeacherName,
      SchoolContactNo: values.SchoolContactNo,
      AddressLine1: values.AddressLine1,
      AddressLine2: values.AddressLine2,
      City: values.City,
      PostCode: values.PostCode,

    };
  }
  const formlik = {
    validationSchema: yup.object().shape({
      SchoolName: yup.string()
        .required('Please enter School Name'),
      UniqueLink: yup.string()
        .required("Please Enter Unique Line code"),
      TeacherName: yup.string()
        .required("Enter teacher name"),
      SchoolContactNo: yup.string()
        .required("Enter Contact Number"),
      AddressLine1: yup.string()
        .required('Enter Address Line 1'),
      AddressLine2: yup.string()
        .required('Enter Address Line 2'),
      City: yup.string()
        .required('Enter City'),
      PostCode: yup.string()
        .required('Enter PostCode'),

    }),
    initialValues: getInitialValues(),
    enableReinitialize: true,
    onSubmit: onSubmit
  };


  return (
    <div className="app-pupil-school">
      <Formik {...formlik} >
        {({ handleSubmit, handleChange, touched, values, setFieldValue, setFieldTouched, isSubmitting, errors }) => (
          <Form >
            <div className='pupil-profile-view'>
              <div className="profile-banner">
              </div>
            </div>
            <Container>
              <div className='form-container'>
                <div className="inner-container">
                  <Row>
                    <Col >
                      <Form.Group className="mb-3" controlId="SchoolName">
                        <Form.Label>School Name</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="SchoolName"
                          onChange={handleChange}
                          value={values.SchoolName}
                          readOnly={true}
                          isValid={touched.SchoolName && !errors.SchoolName}
                          isInvalid={!!errors.SchoolName} />
                        <Form.Control.Feedback type="invalid">{errors.SchoolName}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3" controlId="UniqueLink">
                        <Form.Label>Unique Link Code</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="UniqueLink"
                          onChange={handleChange}
                          value={values.UniqueLink}
                          readOnly={true}
                          isValid={touched.UniqueLink && !errors.UniqueLink}
                          isInvalid={!!errors.UniqueLink} />
                        <Form.Control.Feedback type="invalid">{errors.UniqueLink}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6} sm={12}>
                      <Form.Group className="mb-3" controlId="TeacherName">
                        <Form.Label>Teacher Name</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="TeacherName"
                          onChange={handleChange}
                          value={values.TeacherName}
                          readOnly={true}
                          isValid={touched.TeacherName && !errors.TeacherName}
                          isInvalid={!!errors.TeacherName} />
                        <Form.Control.Feedback type="invalid">{errors.TeacherName}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12}>
                      <Form.Group className="mb-3" controlId="SchoolContactNo">
                        <Form.Label>School Contact tel.</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="SchoolContactNo"
                          onChange={handleChange}
                          value={values.SchoolContactNo}
                          readOnly={true}
                          isValid={touched.SchoolContactNo && !errors.SchoolContactNo}
                          isInvalid={!!errors.SchoolContactNo} />
                        <Form.Control.Feedback type="invalid">{errors.SchoolContactNo}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6} sm={12}>
                      <Form.Group className="mb-3" controlId="AddressLine1">
                        <Form.Label>Address Line 1</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="AddressLine1"
                          onChange={handleChange}
                          value={values.AddressLine1}
                          readOnly={true}
                          isValid={touched.AddressLine1 && !errors.AddressLine1}
                          isInvalid={!!errors.AddressLine1} />
                        <Form.Control.Feedback type="invalid">{errors.AddressLine1}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12}>
                      <Form.Group className="mb-3" controlId="AddressLine2">
                        <Form.Label>Address Line 2</Form.Label>
                        <Form.Control
                          disabled={isSubmitting}
                          type="text"
                          name="AddressLine2"
                          onChange={handleChange}
                          value={values.AddressLine2}
                          readOnly={true}
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
                          readOnly={true}
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
                          readOnly={true}
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
  )
}

export default MySchool
