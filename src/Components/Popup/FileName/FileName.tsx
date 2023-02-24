import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { useStateMounted } from '../../../Core/Hooks';
import { Formik } from 'formik';
import * as yup from 'yup';
import './FileName.scss';
import { BsPlusLg } from 'react-icons/bs';

type FileNameProps = {
  onSubmit: (...any) => void;
  show?: boolean;
  handleClose?: (event: boolean) => void;
  content: any;
  heading: string;
} & typeof defaultProps;

const propTypes = {
  content: PropTypes.any,
  onSubmit: PropTypes.func,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  heading: PropTypes.string
};

const defaultProps = {
  show: true,
  heading: 'Title'
};

function FileName(props: FileNameProps) {

  const { onSubmit, show, handleClose, content, heading } = props;

  const FILENAME_REGEX: any = process.env.REACT_APP_FILENAME_REGEX || '';
  const formRef = useRef<HTMLFormElement>(null);
  const [_show, setShow] = useStateMounted(show);
  const [_content, setRecording] = useStateMounted(content);

  useEffect(() => {
    setRecording(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  const getInitialValues = () => {
    return {
      filename: '',
      content: _content
    };
  };

  const formlik = {
    validationSchema: yup.object().shape({
      filename: yup.string()
        .required(`Please enter ${heading}`)
        .matches(FILENAME_REGEX, `Please provide a valid ${heading}`),
    }),
    initialValues: getInitialValues(),
    enableReinitialize: true,
    onSubmit: onSubmit
  };

  return (
    <Modal className="filename-popup-model" show={_show} onHide={_handleClose}>
      <Formik {...formlik}>
        {({ handleSubmit, touched, handleChange, isSubmitting, errors }) => (
          <Form ref={formRef} onSubmit={handleSubmit}>
            <Modal.Header closeButton />
            <Modal.Body>
              <div className="modal-inner">
                <div className="modal-title text-center">
                  <h2>{heading}</h2>
                </div>
                <div className="app-modal-content">
                  <Form.Control
                    name='filename'
                    type="text"
                    onChange={handleChange}
                    disabled={isSubmitting}
                    isValid={touched.filename && !errors.filename}
                    isInvalid={!!errors.filename} />
                  <Form.Control.Feedback type="invalid">{errors.filename}</Form.Control.Feedback>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type='submit' variant='success' disabled={isSubmitting}><BsPlusLg /> Add</Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

FileName.propTypes = propTypes;

FileName.defaultProps = defaultProps;

export default FileName;