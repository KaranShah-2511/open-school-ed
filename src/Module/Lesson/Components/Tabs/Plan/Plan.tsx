import React from "react";
import PropTypes from "prop-types";
import { Lesson } from "../../../../../Services/LessonService";
import { Col, Form, Row } from "react-bootstrap";
import moment from "moment";
import { Image } from "../../../../../Components";
import { Link } from "react-router-dom";
import Player from "../../../../../Components/Popup/Player";
import { useStateMounted, useDownload } from "../../../../../Core/Hooks";
import { GetUrl } from "../../../../../Core/Utility/Function";
import { Spinner } from "react-bootstrap";
import Scrollbars from "react-custom-scrollbars";
import VideoPopUp from "../../Popup";
import "./Plan.scss";

type PlanProps = {
  utype: string;
  lesson: Lesson;
};

function Plan(props: PlanProps) {
  const { lesson } = props;
  const [playerShow, setPlayerShow] = useStateMounted(false);
  const [playerContent, setPlayerContent] = useStateMounted<any>();
  const [dLoading, download, dFile] = useDownload();
  const [showVideo, setShowVideo] = useStateMounted(false);
  const [videoData, sestVideoData] = useStateMounted();

  const OpenVideo = (channel) => {
    setShowVideo(true);
    sestVideoData(channel);
  };

  return lesson ? (
    <>
      <Row className="lesson-plan">
        <Col lg={9} md={12}>
          <div className="lesson-plan-leftbar">
            <Row>
              <Col md={5} className="mb-30 lesson-subject">
                <label>Subject</label>
                <p>{lesson.SubjectName}</p>
              </Col>
              <Col md={7} className="mb-30 lesson-topic">
                <label>Lesson Topic</label>
                <p>{lesson.LessonTopic}</p>
              </Col>
            </Row>
            <Row>
              <Col md={3} sm={6} className="mb-30 lesson-date">
                <label>Date</label>
                <p>
                  <Image
                    src="/assets/images/svg/calendar-small-icon.svg"
                    alt="Date"
                  />
                  {moment(lesson.Date).format("DD/MM/YYYY")}
                </p>
              </Col>
              <Col md={3} sm={6} className="mb-30 lesson-time">
                <label>Time</label>
                <p>
                  <Image src="/assets/images/svg/clock.svg" alt="Time" />
                  {lesson.StartTime} - {lesson.EndTime}
                </p>
              </Col>
              <Col md={6} className="mb-30 lesson-participants">
                <label>Participants</label>
                <p>
                  <Image src="/assets/images/svg/group.svg" alt="Group" />
                  {lesson.GroupName}
                </p>
              </Col>
            </Row>
            <Row className="mb-30">
              <div className="lesson-description">
                <label>Lesson Description</label>
                <p>{lesson.LessonDescription}</p>
                {lesson.RecordingList.map((item, i) => {
                  return (
                    <Link
                      key={i}
                      to="#"
                      onClick={() => {
                        setPlayerContent(item);
                        setPlayerShow(true);
                      }}
                      className="video-data mr-1"
                    >
                      <Image
                        src="/assets/images/svg/video-icon.svg"
                        alt={item.originalname}
                      />
                      {item.originalname}
                    </Link>
                  );
                })}
              </div>
            </Row>
            {lesson.CheckList && lesson.CheckList.length ? (
              <>
                <Row className="mb-30">
                  <div className="lesson-class-detail">
                    <label className="title-line">
                      <span>Items your class may need</span>
                    </label>
                    <ul>
                      {lesson.CheckList.map((check, i) => {
                        return <li key={i}>{check.ItemName}</li>;
                      })}
                    </ul>
                  </div>
                </Row>
              </>
            ) : null}
            <Row className="mb-30">
              <div className="lesson-individual-pupils">
                <label className="title-line">
                  <span>Individual pupils</span>
                </label>
                {lesson.pupilList.length ? (
                  <ul>
                    {lesson.pupilList.map((pupil, i) => {
                      return (
                        <li key={i}>
                          <Link to="#">
                            <Image
                              domain="server"
                              src={pupil.ProfilePicture}
                              alt={pupil.PupilName}
                              title={pupil.PupilName}
                            />
                            {pupil.PupilName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  "No individual pupils"
                )}
              </div>
            </Row>
            <Row className="mb-30">
              <div className="lesson-class-setting">
                <label className="title-line">
                  <span>Class Settings</span>
                </label>
                <ul>
                  <li>
                    Will this lesson be delivered live{" "}
                    <Form.Check
                      readOnly
                      disabled
                      className="success disabled"
                      checked={lesson.LiveSession}
                      type="switch"
                    />
                  </li>
                  <li>
                    Publish lesson before live lesson{" "}
                    <Form.Check
                      readOnly
                      disabled
                      className="success disabled"
                      checked={lesson.Publish}
                      type="switch"
                    />
                  </li>
                  {/* <li>Switch on in -class voting <Form.Check readOnly disabled className='success disabled' checked={lesson.IsVotingEnabled} type='switch' /></li> */}
                </ul>
              </div>
            </Row>
          </div>
        </Col>
        <Col lg={3} md={12}>
          <div className="lesson-plan-rightbar">
            <div className="learning-material">
              <h2>Learning material</h2>
              {lesson.MaterialList.length ? (
                <>
                  <ul className="learning-material-inner">
                    {lesson.MaterialList.map((item, i) => {
                      const title = item.originalname;
                      const dObj = {
                        url: GetUrl(item.filename, "server"),
                        filename: item.originalname,
                      };
                      return (
                        <li key={i} onClick={() => download(dObj)}>
                          {dLoading && dFile && dFile.url === dObj.url ? (
                            <Spinner
                              animation="border"
                              variant="primary"
                              size="sm"
                            />
                          ) : (
                            <Link to="#">{title}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
              {/* <h2>View lesson recording</h2>
                <Link to="#" className="lesson-recording"><Image src="/assets/images/svg/video-icon.svg" alt="Download File" />Lesson Recording</Link> */}
              {/* <h2>Chat transcript</h2>
                <ul className="learning-material-inner">
                  <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                  <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                  <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                  <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                </ul> */}
            </div>
            <div className="video-material">
              {lesson.ChannelList ? (
                <div className="video-image">
                  <Scrollbars
                    className="scrollbars"
                    style={{
                      width: "100%",
                      height: lesson.ChannelList.length ? "150px" : "",
                    }}
                  >
                    <ul>
                      {lesson.ChannelList.map((item, key) => {
                        return (
                          <li key={key}>
                            <div className="video-thumb"  onClick={() => OpenVideo(item)}></div>
                            <div className="action-title">
                              <Link to="#">
                                <span>{item.Title}</span>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </Scrollbars>
                </div>
              ) : null}
            </div>
          </div>
        </Col>
      </Row>
      {playerShow ? (
        <Player
          data={playerContent}
          handleClose={() => {
            setPlayerShow(false);
            setPlayerContent(null);
          }}
          title={
            playerContent.isNew
              ? playerContent.filename
              : playerContent.originalname
          }
        />
      ) : null}
       {showVideo ? (
        <VideoPopUp
          handleClose={setShowVideo}
          show={true}
          videoData={videoData}
        />
      ) : null}
    </>
  ) : null;
}

Plan.propTypes = {
  utype: PropTypes.string.isRequired,
  lesson: PropTypes.object.isRequired,
};

export default Plan;
