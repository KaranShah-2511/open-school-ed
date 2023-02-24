import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useDownload, useStateMounted } from '../../../../../Core/Hooks';
import { Lesson } from '../../../../../Services/LessonService';
import Image from '../../../../../Components/Image';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { GetUrl } from '../../../../../Core/Utility/Function';
import { useAuth } from '../../../../../Core/Providers';
import './LessonModel.scss';

type LessonModelProps = {
  lesson: Lesson
  show?: boolean;
  handleClose?: (lesson: boolean) => void;
} & typeof defaultProps;

const propTypes = {
  lesson: PropTypes.object.isRequired,
  show: PropTypes.bool,
  handleClose: PropTypes.func,
};

const defaultProps = {
  show: true
};
function LessonModel(props: LessonModelProps) {

  const { show, lesson, handleClose } = props;
  const [_show, setShow] = useStateMounted(show);
  const [dLoading, download, dFile] = useDownload();
  const user = useAuth().user();
  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  return (
    <>
      <Modal className="lesson-view-popup-model" show={_show} onHide={_handleClose}>
        <div className='border-area lesson-popup-view' style={{ borderColor: lesson.SubjectColor }}>
          <Modal.Header closeButton className='lesson-header' >
            <div className="title-bar">
              <div className="subject-title" style={{ borderColor: lesson.SubjectColor }}>
                <h2>{lesson.LessonTopic}</h2>
                <p>{lesson.SubjectName}</p>
              </div>
              <div className="date-time-group">
                <div className="date common-dtg">
                  <Image src="/assets/images/svg/calendar-small-icon.svg" alt="Date" />
                  <span>{moment(lesson.Date).format('DD/MM/YYYY')}</span>
                </div>
                <div className="time common-dtg">
                  <Image src="/assets/images/svg/clock.svg" alt="Time" />
                  <span>{lesson.StartTime} - {lesson.EndTime}</span>
                </div>
                <div className="group common-dtg">
                  <Image src="/assets/images/svg/group.svg" alt="Group" />
                  <span>{lesson.GroupName}</span>
                </div>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="content-inner">
              {
                (lesson.allPupilList.length)
                  ?
                  <div className="users-bar">
                    {
                      lesson.allPupilList.slice(0, 15).map((pupil, i) => {
                        return (
                          <Link to="#" key={i}>
                            <Image domain="server" src={pupil.ProfilePicture} alt={pupil.PupilName} title={pupil.PupilName} />
                          </Link>
                        );
                      })
                    }
                    {
                      (lesson.allPupilList.length > 15)
                        ? <Link to="#">
                          <span>+{lesson.allPupilList.length - 15}</span>
                        </Link>
                        : null
                    }
                  </div>
                  : null
              }
              {
                (lesson.MaterialList.length) ? <>
                  <div className="content">
                    <p>{lesson.LessonDescription}</p>
                  </div><div>
                    <h4>Attachment(s)</h4>
                    <div className="attachment-div">
                      <ul>
                        {
                          lesson.MaterialList.map((material, i) => {
                            const dObj = { url: GetUrl(material.filename, 'server'), filename: material.originalname }
                            return (
                              <li key={i}>
                                <p>
                                  {material.originalname}
                                </p>
                                <a href="#" onClick={() => download(dObj)} >
                                  {(dLoading && (dFile && dFile.url === dObj.url))
                                    ? <Spinner animation='border' variant="primary" size="sm" />
                                    : <Image src="/assets/images/svg/download.svg" alt="Download File" />
                                  }
                                </a>
                              </li>
                            );
                          })
                        }
                      </ul>
                    </div>
                  </div>
                </> : null
              }
              {
                (lesson.CheckList && lesson.CheckList.length) ? <div className="check-list">
                  <h4>Items that your class will need</h4>
                  <ul>
                    {
                      lesson.CheckList.map((check, i) => {
                        return (
                          <li key={i}>{check.ItemName}</li>
                        );
                      })
                    }
                  </ul>
                </div> : null
              }
              <div className="btn-area text-right mt-50">
                <Link to={`/lesson/edit/${lesson.id}`}>
                  {(user.userType.Type != 'pupil')
                    ?
                    <Button variant="outline-dark" type="button" >
                      Edit Class
                    </Button>
                    : null}
                </Link>
                <Button variant="success" className="ml-1" type="submit">Start Class</Button>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

LessonModel.propTypes = propTypes;

LessonModel.defaultProps = defaultProps;

export default LessonModel;