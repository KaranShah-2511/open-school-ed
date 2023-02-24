import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useScreen, useStateMounted } from '../../../Core/Hooks';
import { ScreenParams, ScreenResponse } from '../../../Core/Hooks/Screen';
import { BsPauseCircle, BsPlayCircle, BsPlusLg, BsStopCircle } from 'react-icons/bs';
import FileName from '../FileName';
import './Screen.scss';

type ScreenProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  mediaOpt?: MediaStreamConstraints;
  title?: string;
  onSubmit?: (...any) => void;
} & typeof defaultProps;

const propTypes = {
  onSubmit: PropTypes.func,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  mediaOpt: PropTypes.object,
  title: PropTypes.string
};

const defaultProps = {
  show: true,
  title: 'Screen Recording'
};

function Screen(props: ScreenProps) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const blobVideoRef = useRef<HTMLVideoElement>(null);
  const screenOpt: ScreenParams = {
    media: (props.mediaOpt) ? props.mediaOpt : { audio: true, video: true },
    cameraProperty: { position: 'bottom-right' }
  };
  const screen: ScreenResponse = useScreen(screenOpt, videoRef);
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
    <div className="screen-popup">
      <Modal className="screen-popup-model" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <h3>{props.title}</h3>
        </Modal.Header>
        <Modal.Body>
          {
            (!screen.error && screen.blob)
              ?
              <video
                className='blob'
                src={URL.createObjectURL(screen.blob)}
                controls={true}
                ref={blobVideoRef}
                autoPlay={false}
                style={{ width: '700px', margin: '1em' }}
              />
              : null
          }
          {
            (!screen.error && !screen.stop)
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
            (screen.error)
              ? <>
                <div className='recording-error'>
                  {screen.error}
                </div>
              </>
              : null
          }
        </Modal.Body>
        {
          (!screen.error)
            ?
            <>
              <Modal.Footer>
                {
                  (!screen.stop)
                    ? <>
                      <div className='player-btn-area'>
                        {
                          (!screen.start)
                            ? <>
                              <button title='Start'
                                className={'btn-start ' + ((!screen.start && !screen.stop) ? 'active' : '')}
                                disabled={screen.start || screen.stop}
                                onClick={() => screen.setStart(true)}>
                                <BsPlayCircle />
                              </button>
                            </>
                            : null
                        }
                        {
                          (screen.start)
                            ? <>
                              <button title='Resume'
                                className={'btn-resume ' + ((screen.pause) ? 'active' : '')}
                                disabled={!screen.pause}
                                onClick={() => screen.setResume(true)}>
                                <BsPlayCircle />
                              </button>
                            </>
                            : null
                        }
                        <button title='Pause'
                          className={'btn-pause ' + ((screen.start && !screen.pause) ? 'active' : '')}
                          disabled={!screen.start || screen.pause}
                          onClick={() => screen.setPaush(true)}>
                          <BsPauseCircle />
                        </button>
                        <button title='Stop'
                          className={'btn-stop ' + ((screen.start) ? 'active' : '')}
                          disabled={!screen.start}
                          onClick={() => screen.setStop(true)}>
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
            content={screen.blob}
            onSubmit={onSubmit}
            handleClose={setFilenameShow} />
          : null
      }
    </div>
  );
}

Screen.propTypes = propTypes;

Screen.defaultProps = defaultProps;

export default Screen;