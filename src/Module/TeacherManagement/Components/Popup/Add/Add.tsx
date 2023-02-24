import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useStateMounted } from '../../../../../Core/Hooks';
import { Link } from 'react-router-dom';
import { Image } from '../../../../../Components';
import IconCsv from '../../../../../Assets/Images/Svg/csv.svg';
import IconAdd from '../../../../../Assets/Images/Svg/add-menual.svg';
import { CsvUpload } from '../../../../../Components/Popup';
import { TeacherService } from '../../../../../Services/TeacherService';
import './Add.scss';
import { useAuth } from '../../../../../Core/Providers';

type AddProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  onRefresh?: () => void;
} & typeof defaultProps;

const propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  onRefresh: PropTypes.func
};

const defaultProps = {
  show: true
};

function Add(props: AddProps) {

  const [show, setShow] = useStateMounted(props.show);
  const [error, setError] = useStateMounted<string | null>(null);
  const [success, setSuccess] = useStateMounted<string | null>(null);
  const [progress, setProgress] = useStateMounted(0);
  const [csvUploadShow, setCsvUploadShow] = useStateMounted(false);
  const teacherService = new TeacherService();
  const user = useAuth().user();

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setShow(false);
    if (props.handleClose) {
      props.handleClose(false)
    }
  }

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    setSubmitting(true);
    setProgress(0);
    const progressEvent = (event) => {
      setProgress(Math.round((100 * event.loaded) / event.total));
    };
    await teacherService.csvBySchoolId(user?.UserDetialId, values.csv, progressEvent)
      .then((res) => {
        setSuccess('Teacher upload successfully.');
        setCsvUploadShow(false);
        if (props.onRefresh) {
          props.onRefresh();
        }
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setProgress(0);
      });
  };

  return (
    <>
      <Modal className="teacher-add-popup-model" show={show} onHide={handleClose}>
        <ToastContainer className="p-3 position-fixed" position="top-center">
          <Toast onClose={() => setSuccess(null)} bg={'success'} show={!!success} delay={3000} autohide>
            <Toast.Body>
              {success}
            </Toast.Body>
          </Toast>
        </ToastContainer>
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="modal-inner">
            <div className="modal-title text-center">
              <h2>Add Teaching Staff</h2>
            </div>
            <div className="app-modal-content">
              <ul>
                <li>
                  <Link to="#" onClick={() => setCsvUploadShow(true)} title="Import from CSV">
                    <Image src={IconCsv} alt="Import from CSV" />
                    <span>Import from CSV</span>
                  </Link>
                </li>
                <li>
                  <Link to={'/teacher-management/add'} state={{ returnTo: '/teacher-management' }} title="Add Manually">
                    <Image src={IconAdd} alt="Add Manually" />
                    <span>Add Manually</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {(csvUploadShow)
        ? <CsvUpload
          error={error}
          progress={progress}
          sampleFileLink='sample-files/sample-teacher.csv'
          onSubmit={onSubmit}
          handleClose={setCsvUploadShow} />
        : null}
    </>
  );
}

Add.propTypes = propTypes;

Add.defaultProps = defaultProps;

export default Add;