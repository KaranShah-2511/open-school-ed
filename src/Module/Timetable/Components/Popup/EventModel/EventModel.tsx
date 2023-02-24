import React from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../../../Core/Hooks';
import { MyEvent } from '../../../../../Services/EventService';
import { Modal } from 'react-bootstrap';
import Image from '../../../../../Components/Image';
import moment from 'moment';
import './EventModel.scss';

type EventModelProps = {
  event: MyEvent
  show?: boolean;
  handleClose?: (event: boolean) => void;
} & typeof defaultProps;

const propTypes = {
  event: PropTypes.object.isRequired,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
};

const defaultProps = {
  show: true
};

function EventModel(props: EventModelProps) {

  const { show, event, handleClose } = props;
  const [_show, setShow] = useStateMounted(show);

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  return (
    <>
      <Modal className="event-view-popup-model" show={_show} onHide={_handleClose}>
        <div className='border-area event-popup-view' style={{ borderColor: event.EventColor }}>
          <Modal.Header closeButton>
            <div className="title-bar">
              <div className="subject-title" style={{ borderColor: event.EventColor }}>
                <h2>{event.EventName}</h2>
                <p>{event.EventType}</p>
              </div>
              <div className="date-time-group">
                <div className="date common-dtg">
                  <Image src="/assets/images/svg/calendar-small-icon.svg" alt="Date" />
                  <span>{moment(event.StartDate).format('DD/MM/YYYY')}</span>
                </div>
                <div className="time common-dtg">
                  <Image src="/assets/images/svg/clock.svg" alt="Time" />
                  <span>{event.EventStartTime} - {event.EventEndTime}</span>
                </div>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="content-inner">
              <div className="content">
                <div className="location-div">
                  <p>Location: </p>
                  <p>{event.EventLocation}</p>
                </div>
                <div className="note-div">
                  <p>Note: </p>
                  <p>{event.EventDescription}</p>
                </div>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

EventModel.propTypes = propTypes;

EventModel.defaultProps = defaultProps;

export default EventModel;