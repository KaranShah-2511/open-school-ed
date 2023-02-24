import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation, useParams } from "react-router";
import Skeleton from "react-loading-skeleton";
import { useLayout } from "../../../../../Core/Providers/LayoutProvider";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { useStateMounted, useDownload } from "../../../../../Core/Hooks";
import { Lesson, LessonService } from "../../../../../Services/LessonService";
import { useAuth } from "../../../../../Core/Providers";
import { Col, Row, Toast, ToastContainer } from "react-bootstrap";
import { BsBookmark, BsFillBookmarkFill } from "react-icons/bs";
import { Image } from "../../../../../Components";
import { GetUrl } from "../../../../../Core/Utility/Function";
import { Spinner } from "react-bootstrap";
import jURL from "urijs";
import Scrollbars from "react-custom-scrollbars";
import VideoPopUp from "../../../Components/Popup";
import "./Detail.scss";

type HeadingProps = {
  loading: boolean;
  lesson: Lesson | undefined;
  error: string | null;
  returnTo?: any;
};

function Heading(props: HeadingProps) {
  const { loading, lesson, error, returnTo } = props;

  if (!loading && lesson) {
    return (
      <>
        <Helmet>
          <title>
            {lesson.SubjectName} -{" "}
            {moment(lesson.LessonDate).format("DD/MM/YYYY")}
          </title>
        </Helmet>
        <h2 className="header-title">
          {returnTo ? (
            <Link to={returnTo}>
              <IoMdArrowBack />
            </Link>
          ) : null}
          {lesson.SubjectName} -{" "}
          {moment(lesson.LessonDate).format("DD/MM/YYYY")}
        </h2>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{error ? "Error" : "Loading..."}</title>
      </Helmet>
      <h2 className="header-title">
        {returnTo ? (
          <Link to={returnTo}>
            <IoMdArrowBack />
          </Link>
        ) : null}
        {error ? (
          "Error"
        ) : (
          <>
            <Skeleton containerClassName="skeleton" width={200} inline={true} />
          </>
        )}
      </h2>
    </>
  );
}

Heading.propTypes = {
  loading: PropTypes.bool,
  lesson: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
};

function Detail(props) {
  const lessonID: any = useParams().id;
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [saveLesson, setSaveLesson] = useStateMounted<boolean>(false);
  const [saveLessonSuccess, setSaveLessonSuccess] = useStateMounted<
    string | null
  >(null);
  const [saveLessonError, setSaveLessonError] = useStateMounted<string | null>(
    null
  );
  const [lesson, setLesson] = useStateMounted<Lesson>();
  const [lessonVideo, setLessonVideo] = useStateMounted<any>();
  const lessonService = new LessonService();
  const user = useAuth().user();
  const layout = useLayout();
  const server: any = process.env.REACT_APP_API_ENDPOINT;
  const [dLoading, download, dFile] = useDownload();
  const [showVideo, setShowVideo] = useStateMounted(false);
  const [videoData, sestVideoData] = useStateMounted();
  useEffect(() => {
    (async () => {
      await getLesson();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonID]);

  useEffect(() => {
    const heading = (
      <>
        <Heading
          error={error}
          loading={loading}
          lesson={lesson}
          returnTo={returnTo}
        />
      </>
    );
    const headerRight = (
      <>
        <Link
          to={"/lesson/open-workspace"}
          state={{ returnTo: "/lesson/detail/" + lessonID }}
          className="mr-1 save-btn btn btn-outline-success"
        >
          Open Workspace
        </Link>
        <Link
          to={"/lesson/homework-detail/" + lessonID}
          state={{ returnTo: "/lesson/detail/" + lessonID }}
          className="mr-1 save-btn btn btn-success"
        >
          See Homework
        </Link>
      </>
    );

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: "header-pupil-lesson-detail app-inner",
      mainContentClass: "main-pupil-lesson-detail",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, loading, lesson, error, returnTo, lessonID]);

  useEffect(() => {
    if (lesson && lesson.RecordingList.length) {
      setLessonVideo(lesson.RecordingList[0]);
    }
    if (lesson) {
      setSaveLesson(lesson.SaveLesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  const getLesson = async () => {
    setLoading(true);
    setError(null);
    await lessonService
      .getPupilLesson(lessonID, user.UserDetialId)
      .then((res) => {
        setLesson(res);
      })
      .catch((e) => {
        if (e.type === "client") {
          setError(e.message);
        } else {
          setError("System error occurred!! please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUrl = (link) => {
    let url = jURL(link);
    if (url.is("relative")) {
      url = url.absoluteTo(server);
    }
    return url.toString();
  };

  const onSaveLesson = async () => {
    setSaveLesson(true);
    const params = { SaveLesson: true };
    await lessonService
      .saveLesson(lessonID, user.UserDetialId, params)
      .then(() => {
        setSaveLessonSuccess("Lesson saved successfully.");
      })
      .catch((e) => {
        setSaveLesson(false);
        if (e.type === "client") {
          setSaveLessonError(e.message);
        } else {
          setSaveLessonError("System error occurred!! please try again.");
        }
      });
  };
  const OpenVideo = (channel) => {
    setShowVideo(true);
    sestVideoData(channel);
  };

  return (
    <div className="app-lesson-detail pupil-lesson-detail">
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast
          onClose={() => {
            setSaveLessonError(null);
            setSaveLessonSuccess(null);
          }}
          bg={saveLessonSuccess ? "success" : saveLessonError ? "danger" : ""}
          show={!!saveLessonError || !!saveLessonSuccess}
          delay={3000}
          autohide
        >
          {saveLessonError ? (
            <Toast.Header closeButton={true}>
              <strong className="me-auto">Error</strong>
            </Toast.Header>
          ) : null}
          <Toast.Body>
            {saveLessonError}
            {saveLessonSuccess}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      {loading ? (
        <div className="app-pupil-lesson-video-content">Loading...</div>
      ) : null}
      {error ? (
        <div className="app-pupil-lesson-video-content text-danger">
          {error}
        </div>
      ) : null}
      {!loading && !error && !lesson ? (
        <div className="app-pupil-lesson-video-content">Not found...</div>
      ) : null}
      {!loading && !error && lesson ? (
        <>
          <Row>
            <Col lg={9} md={12}>
              {lessonVideo ? (
                <div className="app-video-wrapper">
                  <video
                    className="loderVideo"
                    src={getUrl(lessonVideo.filename)}
                    controls={true}
                    autoPlay={false}
                  />
                </div>
              ) : null}
              <div className="app-pupil-lesson-video-content">
                <div className="content-author-title">
                  <div className="title-bookmark">
                    <h2>
                      {lesson.SubjectName}: {lesson.LessonTopic}{" "}
                      <span>
                        Published on{" "}
                        {moment(lesson.LessonDate).format("DD MMMM YYYY")}
                      </span>
                    </h2>
                    <div className="bookmark">
                      {saveLesson ? (
                        <>
                          <BsFillBookmarkFill className="save" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <BsBookmark
                            className="click-pointer"
                            onClick={onSaveLesson}
                          />
                          <span>Save</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="lesson-author">
                    <Image
                      domain="server"
                      src={lesson.TeacherProfile}
                      alt={lesson.TeacherFullName}
                    />
                    <span>{lesson.TeacherFullName}</span>
                  </div>
                </div>
                <div className="content">
                  <p>{lesson.LessonDescription}</p>
                </div>
              </div>
            </Col>
            <Col lg={3} md={12}>
              <div className="lesson-right">
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

                  {lesson.ChannelList ? (
                    <>
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
                                  <div
                                    className="video-thumb"
                                    onClick={() => OpenVideo(item)}
                                  ></div>
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
                    </>
                  ) : null}
                  {showVideo ? (
                    <VideoPopUp
                      handleClose={setShowVideo}
                      show={true}
                      videoData={videoData}
                    />
                  ) : null}
                  <h2>Saved workspaces</h2>
                  {lesson.WorkSpacelist.length ? (
                    <>
                      <ul className="learning-material-inner workspaces">
                        {lesson.WorkSpacelist.map((item, i) => {
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
                </div>
              </div>
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
}

export default Detail;
