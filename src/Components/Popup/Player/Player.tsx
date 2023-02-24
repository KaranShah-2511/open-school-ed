import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../Core/Hooks';
import { Modal } from 'react-bootstrap';
import jURL from 'urijs';
import './Player.scss';

type PlayerProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  data: any;
  title?: string;
} & typeof defaultProps;

const propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  data: PropTypes.object,
  title: PropTypes.string
};

const defaultProps = {
  show: true,
  title: 'Player'
};

function Player(props: PlayerProps) {

  const { show, handleClose, data, title } = props;

  const [_show, setShow] = useStateMounted(show);
  const [_title, setTitle] = useStateMounted(title);
  const [content, setContent] = useStateMounted(data);
  const server: any = process.env.REACT_APP_API_ENDPOINT;

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  useEffect(() => {
    setTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    setContent(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const getUrl = (link) => {
    let url = jURL(link);
    if (url.is('relative')) {
      url = url.absoluteTo(server);
    }
    return url.toString();
  };

  return (
    <div className="player-popup">
      <Modal className="player-popup-model" show={_show} onHide={_handleClose}>
        <Modal.Header closeButton>
          <h3>{_title}</h3>
        </Modal.Header>
        <Modal.Body>
          {
            (content)
              ? (content.isNew)
                ? <video
                  className='blob'
                  src={URL.createObjectURL(content.content)}
                  controls={true}
                  autoPlay={false}
                  style={{ width: '700px', margin: '1em' }}
                />
                : <video
                  className='blob'
                  src={getUrl(content.filename)}
                  controls={true}
                  autoPlay={false}
                  style={{ width: '700px', height: '500px', margin: '1em' }}
                />
              : null
          }
        </Modal.Body>
      </Modal>
    </div>
  );
}

Player.propTypes = propTypes;

Player.defaultProps = defaultProps;

export default Player;