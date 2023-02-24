import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import IconScreenCamera from '../../../Assets/Images/Svg/screen-camera.svg';
import IconScreenVoice from '../../../Assets/Images/Svg/screen-voice.svg';
import IconCamera from '../../../Assets/Images/Svg/camera.svg';
import { useStateMounted } from '../../../Core/Hooks';
import Image from '../../Image';
import Camera from '../Camera';
import Screen from '../Screen';
import './Recording.scss';

type RecordingProps = {
  children?: JSX.Element | JSX.Element[];
  getRecording?: (...any) => void;
} & typeof defaultProps;

const propTypes = {
  children: PropTypes.object,
  getRecording: PropTypes.func,
};

const defaultProps = {
  children: <>
    <h2>Add Recording</h2>
    <p>Record an instructional video for your pupils.</p>
  </>
};

function Recording(props: RecordingProps) {

  const { children, getRecording } = props;
  const [show, setShow] = useStateMounted(false);
  const handleClose = () => {
    setShow(false);
  }
  const handleShow = () => setShow(true);
  const [screenVoiceShow, setScreenVoiceShow] = useStateMounted(false);
  const [screenShow, setScreenShow] = useStateMounted(false);
  const [cameraShow, setCameraShow] = useStateMounted(false);

  const onSubmit = async (values) => {
    if (getRecording) {
      values.filename = values.filename.trim();
      getRecording(values);
    }
    handleClose();
  }

  return (
    <>
      <div className="recording-popup">
        <Link to="#" onClick={handleShow} className="video-data"><span className="add-recording-icon"></span> Add Recording</Link>
        <Modal className="recording-popup-model" show={show} onHide={handleClose}>
          <Modal.Header closeButton />
          <Modal.Body>
            <div className="modal-inner">
              <div className="modal-title text-center">
                {children}
              </div>
              <div className="app-modal-content">
                <ul>
                  <li>
                    <Link to="#" onClick={() => setScreenShow(true)} title="Screen + Camera">
                      <Image src={IconScreenCamera} alt="Screen + Camera" />
                      <span>Screen + Camera</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" onClick={() => setScreenVoiceShow(true)} title="Screen + Voice">
                      <Image src={IconScreenVoice} alt="Screen + Voice" />
                      <span>Screen + Voice</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" onClick={() => setCameraShow(true)} title="Camera Only">
                      <Image src={IconCamera} alt="Camera Only" />
                      <span>Camera Only</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      {(screenShow) ? <Screen title={'Screen + Camera'} onSubmit={onSubmit} handleClose={setScreenShow} /> : null}
      {(screenVoiceShow) ? <Screen title={'Screen + Voice'} onSubmit={onSubmit} handleClose={setScreenVoiceShow} mediaOpt={{ audio: true, video: false }} /> : null}
      {(cameraShow) ? <Camera onSubmit={onSubmit} handleClose={setCameraShow} /> : null}
    </>
  );
}

Recording.propTypes = propTypes;

Recording.defaultProps = defaultProps;

export default Recording;