import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useStateMounted } from "../../../../Core/Hooks";
import PropTypes from "prop-types";
import "./VideoPopUp.scss";

type VideoPopUpProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  videoData: any;
} & typeof defaultProps;

const propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  show: true,
};

const urlify = (text) => {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + "</a>";
  });
};

function VideoPopUp(props: VideoPopUpProps) {
  const { show, handleClose, videoData } = props;
  const [_show, setShow] = useStateMounted(show);
  const [loadmore, setLoadMore] = useStateMounted(false);
  const discription = urlify(videoData.Description);

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false);
    }
  };
  const VideoLink = `https://www.youtube.com/embed/${videoData.VideoId}`;
  return (
    <Modal className="show-video-model" show={_show} onHide={_handleClose}>
      <div className="show-video-popup">
        <div className="border-area">
          <Modal.Header closeButton>
            <h2 className="video-title">{videoData.ChannelTitle}</h2>
          </Modal.Header>
          <Modal.Body className="video-container">
            <iframe
              src={VideoLink}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={videoData.ChannelTitle}
              width="100%"
              height="400px"
            />
          </Modal.Body>
          <p className={loadmore ? "description" : "small-description"}>
            {/* {discription} */}
            <div dangerouslySetInnerHTML={{ __html: discription }} />
          </p>
          {!loadmore ? (
            <Button
              className="btn btn-success btn-sm load-button"
              onClick={() => setLoadMore(true)}
            >
              Show More
            </Button>
          ) : (
            <Button
              className="btn btn-success btn-sm load-button"
              onClick={() => setLoadMore(false)}
            >
              Show Less
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default VideoPopUp;
