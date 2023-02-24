import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { GlobalMessage, GlobalMessageService, MessageParams } from '../../../../Services/GlobalMessageService';
import { PupilService } from '../../../../Services/PupilService';
import { IoMdArrowBack } from 'react-icons/io';
import { Button, Col, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../../../Core/Providers';
import Select from 'react-select';
import './AddEdit.scss';

type HeadingProps = {
  utype?: string;
  loading: boolean;
  globalMessage: GlobalMessage | undefined;
  error: string | null;
  globalMessageID?: string;
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const { loading, globalMessage, error, returnTo } = props;

  if (!loading && globalMessage && globalMessage.Status !== 'Sent') {
    return <>
      <Helmet>
        <title>
          {globalMessage.Title}
        </title>
      </Helmet>
      <h2 className="header-title">
        {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
        {globalMessage.Title}
      </h2>
    </>;
  }

  if ((loading || error) && !globalMessage) {
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
        New message
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
      New message
    </h2>
  </>;
};

Heading.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  globalMessage: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
  globalMessageID: PropTypes.string,
};

function AddEdit() {

  const globalMessageID: any = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [submitType, setSubmitType] = useStateMounted<'Sent' | 'Draft'>('Sent');
  const [globalMessage, setGlobalMessage] = useStateMounted<GlobalMessage>();
  const [parentLoading, setParentLoading] = useStateMounted<boolean>(false);
  const [parents, setParents] = useStateMounted<{ value: string | number, label: string, MobileNumber: string | number }[]>([]);
  const globalMessageService = new GlobalMessageService();
  const pupilService = new PupilService();
  const layout = useLayout();
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAuth().user();

  const frmSubmit = (e, type: 'Sent' | 'Draft') => {
    setSubmitType(type);
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
      await getParentList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const heading = <>
      <Heading
        error={error}
        loading={loading}
        globalMessage={globalMessage}
        globalMessageID={globalMessageID}
        returnTo={returnTo}
      />
    </>;

    const headerRight = <>
      {
        (!loading && globalMessage)
          ? <>
            <Button variant='outline-success' className='mr-1 save-btn'
              disabled={frmSubmitting}
              onClick={(e) => frmSubmit(e, 'Draft')} >
              Save as Draft
              {(frmSubmitting && submitType === 'Draft') ? <Spinner className="spinner" animation="border" size="sm" /> : null}
            </Button>
            <Button variant='success' className='mr-1 save-btn'
              disabled={frmSubmitting}
              onClick={(e) => frmSubmit(e, 'Sent')} >
              Send Message
              {(frmSubmitting && submitType === 'Sent') ? <Spinner className="spinner" animation="border" size="sm" /> : null}
            </Button>
          </>
          : (
            (loading && !globalMessage)
              ? <>
                <Skeleton containerClassName="skeleton" width={170} inline={true} />
              </>
              : <>
                <Button variant='outline-success' className='mr-1 save-btn'
                  disabled={frmSubmitting}
                  onClick={(e) => frmSubmit(e, 'Draft')} >
                  Save as Draft
                  {(frmSubmitting && submitType === 'Draft') ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                </Button>
                <Button variant='success' className='mr-1 save-btn'
                  disabled={frmSubmitting}
                  onClick={(e) => frmSubmit(e, 'Sent')} >
                  Send Message
                  {(frmSubmitting && submitType === 'Sent') ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                </Button>
              </>
          )
      }
    </>;

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: 'global-message-addedit-header',
      mainContentClass: 'global-message-addedit-main',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, globalMessage, layout, globalMessageID, returnTo, formRef, frmSubmitting, submitType]);

  useEffect(() => {
    (async () => {
      if (globalMessageID) {
        await getGlobalMessage();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalMessageID])

  const getGlobalMessage = async () => {
    setLoading(true);
    setError(null);
    await globalMessageService.get(globalMessageID)
      .then((res) => {
        setGlobalMessage(res);
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

  const getParentList = async () => {
    setParentLoading(true);
    let callback;
    if (user.userType.Type === 'school') {
      callback = pupilService.getParentListBySchoolID(user.UserDetialId)
    } else {
      callback = pupilService.getParentListByTeacherID(user.id)
    }
    await callback
      .then((res) => {
        const data = res.map((parent) => {
          return {
            value: parent.PupilId,
            label: parent.FullName,
            MobileNumber: parent.MobileNumber
          };
        })
        setParents(data);
      })
      .catch((e) => { })
      .finally(() => {
        setParentLoading(false);
      });
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setFrmSubmitting(true);
    let callback;
    const pupilList = (values.SendToAll === false)
      ? values.PupilList.map((p) => { return { MobileNumber: p.MobileNumber }; })
      : parents.map((p) => { return { MobileNumber: p.MobileNumber }; });
    const params: MessageParams = {
      Title: values.Title,
      Message: values.Message,
      SendToAll: values.SendToAll,
      Status: submitType,
      Type: values.Type,
      CreatedBy: values.CreatedBy,
      PupilList: pupilList
    };
    if (globalMessage && globalMessage.Status === 'Draft') {
      callback = globalMessageService.update(globalMessage.id, params);
    } else {
      callback = globalMessageService.create(params);
    }
    await callback
      .then(async (res) => {
        navigate('/global-message');
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
    const pupilList = (globalMessage?.SendToAll)
      ? []
      : (globalMessage?.pupilList && globalMessage.pupilList.length)
        ? parents.filter((p) => globalMessage.pupilList.filter((gp) => p.MobileNumber === gp.MobileNumber).length)
        : [];
    return {
      globalmessageId: globalMessage?.id || '',
      CreatedBy: (user.userType.Type === 'school') ? user.UserDetialId : user.id,
      Type: (user.userType.Type === 'school') ? "S" : "T",
      Title: globalMessage?.Title || '',
      Message: globalMessage?.Message || '',
      SendToAll: globalMessage?.SendToAll || false,
      PupilList: pupilList || [],
    };
  };

  const onValidate = (values) => {
    const errors: any = {};

    if (values.SendToAll === false && values.PupilList.length === 0) {
      errors.PupilList = 'Pick at least 1 recipient';
    } else if (values.SendToAll === true && parents.length === 0) {
      errors.PupilList = 'No recipient';
    }

    return errors;
  };

  const formlik = {
    validationSchema: yup.object().shape({
      Title: yup.string()
        .required('Please enter Title'),
      Message: yup.string()
        .required('Please enter Message')
    }),
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validate: onValidate,
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
      <div className="app-global-message-addedit">
        <Formik {...formlik}>
          {({ handleSubmit, handleChange, touched, values, setFieldValue, setFieldTouched, isSubmitting, errors }) => (
            <Form ref={formRef} onSubmit={handleSubmit}>
              <div className='form-container'>
                <Row>
                  <Col lg={6} sm={12}>
                    <Form.Group className="mb-3" controlId="Title">
                      <Form.Label>Message title</Form.Label>
                      <Form.Control
                        type="text"
                        name="Title"
                        disabled={isSubmitting}
                        onChange={handleChange}
                        value={values.Title}
                        isValid={touched.Title && !errors.Title}
                        isInvalid={!!errors.Title} />
                      <Form.Control.Feedback type="invalid">{errors.Title}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col lg={8} sm={12}>
                    <Form.Group className="mb-4" controlId='PupilList'>
                      <Form.Label>Recipient</Form.Label>
                      <Select
                        closeMenuOnSelect={false}
                        isMulti
                        isDisabled={isSubmitting}
                        isLoading={parentLoading}
                        onChange={(options) => setFieldValue('PupilList', options)}
                        onBlur={() => setFieldTouched('PupilList', true)}
                        noOptionsMessage={() => "No recipient"}
                        placeholder="Enter recipient name or toggle to send to all"
                        options={parents}
                        value={values.PupilList}
                      />
                      <Form.Control.Feedback
                        className={(errors.PupilList) ? 'd-block' : ''}
                        type="invalid">{errors.PupilList}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={4} sm={12}>
                    <Form.Label>&nbsp;</Form.Label>
                    <Form.Group className="m-1 label-switch" controlId='SendToAll'>
                      <Form.Label>Send to all parents</Form.Label>
                      <Form.Check
                        disabled={isSubmitting}
                        className="success"
                        name="SendToAll"
                        checked={values.SendToAll}
                        onChange={handleChange}
                        type='switch' />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col lg={8} sm={12}>
                    <Form.Group className="mb-4" controlId='Message'>
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        disabled={isSubmitting}
                        name="Message"
                        rows={3}
                        as="textarea"
                        placeholder=""
                        onChange={handleChange}
                        value={values.Message}
                        isValid={touched.Message && !errors.Message}
                        isInvalid={!!errors.Message} />
                      <Form.Control.Feedback type="invalid">{errors.Message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row></Row>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default AddEdit;
