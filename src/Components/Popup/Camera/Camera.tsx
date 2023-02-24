import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useCamera, useStateMounted } from '../../../Core/Hooks';
import { CameraResponse } from '../../../Core/Hooks/Camera';
import { BsPauseCircle, BsPlayCircle, BsPlusLg, BsStopCircle } from 'react-icons/bs';
import './Camera.scss';
import FileName from '../FileName';

type CameraProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  title?: string;
  onSubmit?: (...any) => void;
} & typeof defaultProps;

const propTypes = {
  onSubmit: PropTypes.func,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  title: PropTypes.string
};

const defaultProps = {
  show: true,
  title: 'Camera Only'
};

function Camera(props: CameraProps) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const blobVideoRef = useRef<HTMLVideoElement>(null);
  const camera: CameraResponse = useCamera({}, videoRef);
  const [show, setShow] = useStateMounted(props.show);
  const [filenameShow, setFilenameShow] = useStateMounted(false);

  const handleClose = () => {
    setShow(false);
    if (props.handleClose) {
      props.handleClose(false)
    }
  }

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    if (props.onSubmit) {
      props.onSubmit(values);
    }
    handleClose();
  }

  return (
    <div className="camera-popup">
      <Modal className="camera-popup-model" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <h3>{props.title}</h3>
        </Modal.Header>
        <Modal.Body>
          {
            (!camera.error && camera.blob)
              ?
              <video
                className='blob'
                src={URL.createObjectURL(camera.blob)}
                controls={true}
                ref={blobVideoRef}
                autoPlay={false}
                style={{ width: '700px', margin: '1em' }}
              />
              : null
          }
          {
            (!camera.error && !camera.stop)
              ?
              <video
                controls={false}
                autoPlay
                ref={videoRef}
                style={{ width: '700px', margin: '1em' }}
              />
              : null
          }
          {
            (camera.error)
              ? <>
                <div className='recording-error'>
                  {camera.error}
                </div>
              </>
              : null
          }
        </Modal.Body>
        {
          (!camera.error)
            ?
            <>
              <Modal.Footer>
                {
                  (!camera.stop)
                    ? <>
                      <div className='player-btn-area'>
                        {
                          (!camera.start)
                            ? <>
                              <button title='Start'
                                className={'btn-start ' + ((!camera.start && !camera.stop) ? 'active' : '')}
                                disabled={camera.start || camera.stop}
                                onClick={() => camera.setStart(true)}>
                                <BsPlayCircle />
                              </button>
                            </>
                            : null
                        }
                        {
                          (camera.start)
                            ? <>
                              <button title='Resume'
                                className={'btn-resume ' + ((camera.pause) ? 'active' : '')}
                                disabled={!camera.pause}
                                onClick={() => camera.setResume(true)}>
                                <BsPlayCircle />
                              </button>
                            </>
                            : null
                        }
                        <button title='Pause'
                          className={'btn-pause ' + ((camera.start && !camera.pause) ? 'active' : '')}
                          disabled={!camera.start || camera.pause}
                          onClick={() => camera.setPaush(true)}>
                          <BsPauseCircle />
                        </button>
                        <button title='Stop'
                          className={'btn-stop ' + ((camera.start) ? 'active' : '')}
                          disabled={!camera.start}
                          onClick={() => camera.setStop(true)}>
                          <BsStopCircle />
                        </button>
                      </div>



                    </>
                    : <Button variant='success' onClick={() => setFilenameShow(true)}><BsPlusLg />Add</Button>
                }
              </Modal.Footer>
            </>
            : null
        }
      </Modal>
      {
        (filenameShow)
          ? <FileName
            content={camera.blob}
            onSubmit={onSubmit}
            handleClose={setFilenameShow} />
          : null
      }
    </div>
  );
}

Camera.propTypes = propTypes;

Camera.defaultProps = defaultProps;

export default Camera;