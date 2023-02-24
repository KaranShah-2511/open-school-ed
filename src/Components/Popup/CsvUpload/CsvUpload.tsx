import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import { useStateMounted } from '../../../Core/Hooks';
import { Formik } from 'formik';
import * as yup from 'yup';
import './CsvUpload.scss';
import { Link } from 'react-router-dom';

type CsvUploadProps = {
  onSubmit: (...any) => void;
  show?: boolean;
  handleClose?: (event: boolean) => void;
  progress?: number;
  progressLabel: string;
  sampleFileLink: string;
  error?: any;
} & typeof defaultProps;

const propTypes = {
  onSubmit: PropTypes.func,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  progress: PropTypes.number,
  progressLabel: PropTypes.string,
  sampleFileLink: PropTypes.string,
  error: PropTypes.string
};

const defaultProps = {
  show: true,
  progress: 0,
  progressLabel: '',
  sampleFileLink: '',
  error: ''
};

function CsvUpload(props: CsvUploadProps) {

  const { onSubmit, show, progress, progressLabel, sampleFileLink, error, handleClose } = props;

  const csvType = (process.env.REACT_APP_CSV_TYPE || '').split('|');
  const formRef = useRef<HTMLFormElement>(null);
  const [_error, setError] = useStateMounted<string | null>(null);
  const [_show, setShow] = useStateMounted(show);
  const [_progress, setProgress] = useStateMounted(progress);
  const [_progressLabel] = useStateMounted(progressLabel);

  useEffect(() => {
    setError(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    setProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  const getInitialValues = () => {
    const csv: any = '';
    return {
      csv: csv,
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      csv: yup.mixed()
        .test('fileFormat', 'Invalid CSV file', (value) => {
          return (value && csvType.includes(value.type));
        })
        .test('fileSize', 'Please upload valid file', (value) => {
          return (value && value.size >= 50);
        })
    }),
    initialValues: getInitialValues(),
    onSubmit: onSubmit
  };

  return (
    <Modal className="csvupload-popup-model" show={_show} onHide={_handleClose}>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast onClose={() => setError(null)} bg={'danger'} show={!!_error} delay={3000} autohide>
          <Toast.Header closeButton={true}><strong className="me-auto">Error</strong></Toast.Header>
          <Toast.Body>
            {_error}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Modal.Header closeButton />
      <Modal.Body>
        <Formik {...formlik}>
          {({ handleSubmit, touched, setFieldValue, isSubmitting, errors }) => (
            <Form ref={formRef} onSubmit={handleSubmit}>
              <div className="modal-inner">
                <div className="modal-title text-center">
                  <h2>Upload CSV</h2>
                </div>
                <div className="app-modal-content">
                  <div className="app-fileuploader">
                    <Form.Control
                      name='csv'
                      type="file"
                      onChange={(e: any) => {
                        setFieldValue("csv", e.currentTarget.files[0]);
                        setTimeout(() => {
                          if (formRef.current) {
                            if (typeof formRef.current.requestSubmit === 'function') {
                              formRef.current.requestSubmit();
                            } else {
                              formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                            }
                            formRef.current.reset();
                          }
                        }, 100);
                      }}
                      disabled={isSubmitting}
                      isValid={touched.csv && !errors.csv}
                      isInvalid={!!errors.csv} />
                    <Form.Control.Feedback type="invalid">{errors.csv}</Form.Control.Feedback>
                    {
                      (_progress)
                        ? <ProgressBar animated now={_progress} label={_progressLabel} />
                        : null
                    }
                  </div>
                  {
                    (sampleFileLink)
                      ? <Link to={sampleFileLink} target="_blank" download className='sample-download-link'>Sample File Download</Link>
                      : null
                  }
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

CsvUpload.propTypes = propTypes;

CsvUpload.defaultProps = defaultProps;

export default CsvUpload;