import React, { useEffect, useRef } from "react";
import * as yup from "yup";
import PropTypes from "prop-types";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  Button,
  Col,
  Form,
  Row,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { DatePicker } from "react-nice-dates";
import { enGB } from "date-fns/locale";
import { Link } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { Image } from "../../../../../Components";
import { FileName, Recording } from "../../../../../Components/Popup";
import { FieldArray, Formik, getIn } from "formik";
import {
  DeleteLessonFileParam,
  Lesson,
  LessonParam,
  LessonService,
  Subject,
} from "../../../../../Services/LessonService";
import { useStateMounted, useDownload } from "../../../../../Core/Hooks";
import { useAuth, useLayout } from "../../../../../Core/Providers";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { IoMdArrowBack } from "react-icons/io";
import Skeleton from "react-loading-skeleton";
import {
  GroupSetupList,
  PupilService,
} from "../../../../../Services/PupilService";
import {
  timeByStartEnd,
  TimeByStartEnd,
} from "../../../../../Core/Utility/Datetime";
import Select from "react-select";
import "./AddEdit.scss";
import { LessonHomeworkFileParam } from "../../../../../Services/HomeworkService";
import Player from "../../../../../Components/Popup/Player";
import { QuickBlox } from "../../../../../Services/QuickBloxService";
import { GetUrl } from "../../../../../Core/Utility/Function";
import { ChannelData } from "../../../../../Services/TeacherService";
import { setDate } from "date-fns/esm";
import Scrollbars from "react-custom-scrollbars";
import { DataStore } from "../../../../../Core/Services/DataService";

type HeadingProps = {
  utype?: string;
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
            {lesson.SubjectName} - {moment(lesson.Date).format("DD/MM/YYYY")}
          </title>
        </Helmet>
        <h1 className="header-title">
          {returnTo ? (
            <Link to={returnTo}>
              <IoMdArrowBack />
            </Link>
          ) : null}
          {lesson.SubjectName} - {moment(lesson.Date).format("DD/MM/YYYY")}
        </h1>
      </>
    );
  }

  if ((loading || error) && !lesson) {
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
              <Skeleton
                containerClassName="skeleton"
                width={200}
                inline={true}
              />
            </>
          )}
        </h2>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Add New Lesson</title>
      </Helmet>
      <h2 className="header-title">
        {returnTo ? (
          <Link to={returnTo}>
            <IoMdArrowBack />
          </Link>
        ) : null}
        Add New Lesson
      </h2>
    </>
  );
}

Heading.propTypes = {
  utype: PropTypes.string,
  loading: PropTypes.bool,
  lesson: PropTypes.object,
  error: PropTypes.string,
  returnTo: PropTypes.string,
};

function AddEdit() {
  const dataService = DataStore;
  const lessonID: any = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [showSuccess, setShowSuccess] = useStateMounted<string | null>(null);
  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [error, setError] = useStateMounted<string | null>(null);
  const [lesson, setLesson] = useStateMounted<Lesson>();
  const [tmpLesson, setTmpLesson] = useStateMounted<any>();
  const [subjectLoading, setSubjectLoading] = useStateMounted<boolean>(false);
  const [subjectError, setSubjectError] = useStateMounted<string | null>(null);
  const [subject, setSubject] = useStateMounted<Subject[]>([]);
  const [ppLoading, setPpLoading] = useStateMounted<boolean>(false);
  const [ppError, setPpError] = useStateMounted<string | null>(null);
  const [participants, setParticipants] = useStateMounted<GroupSetupList[]>([]);
  const [allPupilLoading, setAllPupilLoading] = useStateMounted<boolean>(true);
  const [allPupilError, setAllPupilError] = useStateMounted<string | null>(
    null
  );
  const [allPupilList, setAllPupilList] = useStateMounted<
    {
      value: string | number;
      label: any;
      ProfilePicture: string;
      QBUserID: string | number;
    }[]
  >([]);
  const [pupilList, setPupilList] = useStateMounted<
    {
      value: string | number;
      label: any;
      ProfilePicture: string;
      QBUserID: string | number;
    }[]
  >([]);
  const [times, setTimes] = useStateMounted<TimeByStartEnd[]>([]);
  const [filenameShow, setFilenameShow] = useStateMounted(false);
  const [fileContent, setFileContent] = useStateMounted();
  const [playerShow, setPlayerShow] = useStateMounted(false);
  const [playerContent, setPlayerContent] = useStateMounted<any>();
  const [materialError, setMaterialError] = useStateMounted<string | null>(
    null
  );
  const [removeRecording, setRemoveRecording] = useStateMounted<any[]>([]);
  const [removeMaterial, setRemoveMaterial] = useStateMounted<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [dLoading, download, dFile] = useDownload();
  const lessonService = new LessonService();
  const pupilService = new PupilService();
  const layout = useLayout();
  const user = useAuth().user();
  const materialType = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/pdf",
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  const paths = location.pathname;

  const frmSubmit = (e) => {
    if (formRef.current) {
      if (typeof formRef.current.requestSubmit === "function") {
        formRef.current.requestSubmit();
      } else {
        formRef.current.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }
    }
  };

  useEffect(() => {
    (async () => {
      await dataService
        .get("LESSON_TMP")
        .then((tmpData) => setTmpLesson(tmpData));
      setTimes(timeByStartEnd("06:00 AM", "24:00 AM", 30));
      getSubject();
      getParticipants();
      getPupilList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSubject = async () => {
    setSubjectLoading(true);
    setSubjectError(null);
    await lessonService
      .getSubject(user.SchoolId)
      .then(async (res) => {
        setSubject(res);
      })
      .catch((e) => {
        if (e.type === "client") {
          setSubjectError(e.message);
        } else {
          setSubjectError("System error occurred!! please try again.");
        }
      })
      .finally(() => {
        setSubjectLoading(false);
      });
  };

  const getParticipants = async () => {
    setPpLoading(true);
    setPpError(null);
    await pupilService
      .groupSetupListByTeacherID(user.id)
      .then(async (res) => {
        setParticipants(res);
      })
      .catch((e) => {
        if (e.type === "client") {
          setPpError(e.message);
        } else {
          setPpError("System error occurred!! please try again.");
        }
      })
      .finally(() => {
        setPpLoading(false);
      });
  };

  const getPupilList = async () => {
    setAllPupilLoading(true);
    setAllPupilError(null);
    await pupilService
      .pupilGroupSetupByTeacherID(user.id)
      .then((res) => {
        const data = res.map((p) => {
          return {
            value: p.PupilId,
            label: (
              <>
                <Image
                  domain="server"
                  src={p.ProfilePicture}
                  alt={p.FullName}
                />
                <span>{p.FullName}</span>
              </>
            ),
            ProfilePicture: p.ProfilePicture,
            QBUserID: p.QBUserID,
          };
        });
        setAllPupilList(data);
      })
      .catch((e) => {
        if (e.type === "client") {
          setAllPupilError(e.message);
        } else {
          setAllPupilError("System error occurred!! please try again.");
        }
      })
      .finally(() => {
        setAllPupilLoading(false);
      });
  };

  useEffect(() => {
    (async () => {
      if (lessonID) {
        await getLesson();
      }
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
        {!loading && lesson ? (
          <>
            <Button
              variant="success"
              className="save-btn mr-1"
              disabled={frmSubmitting}
              onClick={frmSubmit}
            >
              Update Lesson
              {frmSubmitting ? (
                <Spinner className="spinner" animation="border" size="sm" />
              ) : null}
            </Button>
          </>
        ) : loading && !lesson ? (
          <>
            <Skeleton containerClassName="skeleton" width={170} inline={true} />
          </>
        ) : (
          <>
            <Button
              variant="success"
              className="save-btn mr-1"
              disabled={frmSubmitting}
              onClick={frmSubmit}
            >
              Add Lesson
              {frmSubmitting ? (
                <Spinner className="spinner" animation="border" size="sm" />
              ) : null}
            </Button>
          </>
        )}
      </>
    );

    layout.clear().set({
      heading: heading,
      headerRight: headerRight,
      headerClass: "lesson-addedit-header app-inner",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, lesson, error, returnTo, frmSubmitting]);

  useEffect(() => {
    if (!allPupilList.length || !participants.length) return;
    if (lesson) {
      changeParticipant(lesson.PupilGroupId);
    } else {
      changeParticipant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, allPupilList, participants]);

  const getLesson = async () => {
    setLoading(true);
    setError(null);
    await lessonService
      .get(lessonID)
      .then((res) => {
        if (res.id) {
          setLesson(res);
        } else {
          setError("Not record found!");
        }
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

  useEffect(() => {
    if (lesson && subject) {
      const subjectText = lesson.SubjectId
        ? subject.filter((s) => s.id === lesson.SubjectId)[0]
        : "";
      dataService.set("LESSON_TMP", { ...lesson, SubjectText: subjectText });
    }
  }, [lesson, subject]);

  const getSelectParticipant = (id) => {
    return participants.filter((gp) => gp.id === id)[0];
  };

  const changeParticipant = (gpID?: any, setValues?: (values: any) => void) => {
    let pupils = allPupilList;
    if (gpID) {
      const gPupilList = getSelectParticipant(gpID);
      if (gPupilList && gPupilList.pupilList.length) {
        pupils = allPupilList.filter(
          (ap) =>
            !gPupilList.pupilList.filter((gp) => gp.PupilId === ap.value).length
        );
      }
      setPupilList(pupils);
    }
    if (setValues) {
      setValues((prevValues) => {
        prevValues.PupilList = pupils.filter(
          (p) =>
            prevValues.PupilList.filter((pp) => pp.value === p.value).length
        );
        return prevValues;
      });
    }
    setPupilList(pupils);
  };

  useEffect(() => {
    dataService.set("LESSON_TMP", lesson);
  }, [lesson]);
  useEffect(() => {
    if (tmpLesson) {
      dataService.set("LESSON_TMP", tmpLesson);
    }
  }, [tmpLesson]);

  const getInitialValues = () => {
    const date: any = moment(lesson?.Date).toDate();
    let pupils: any = [];
    if (allPupilList.length && lesson?.pupilList.length) {
      pupils = allPupilList.filter(
        (ap) => lesson?.pupilList.filter((lp) => lp.PupilId === ap.value).length
      );
    }
    let materialList: any = lesson?.MaterialList || [];
    let recordingList: any = lesson?.RecordingList || [];

    return {
      SubjectId: tmpLesson ? tmpLesson.SubjectId : lesson?.SubjectId,
      LessonTopic: tmpLesson ? tmpLesson.LessonTopic : lesson?.LessonTopic,
      Date: tmpLesson ? tmpLesson.Date : date,
      StartTime: tmpLesson ? tmpLesson.StartTime : lesson?.StartTime || "",
      EndTime: tmpLesson ? tmpLesson.EndTime : lesson?.EndTime || "",
      PupilGroupId: tmpLesson ? tmpLesson.PupilGroupId : lesson?.PupilGroupId,
      LessonDescription: tmpLesson
        ? tmpLesson.LessonDescription
        : lesson?.LessonDescription,
      Publish: tmpLesson ? tmpLesson.Publish : lesson?.Publish || false,
      LiveSession: tmpLesson
        ? tmpLesson.LiveSession
        : lesson?.LiveSession || false,
      IsVotingEnabled: tmpLesson
        ? tmpLesson.IsVotingEnabled
        : lesson?.IsVotingEnabled || false,
      CheckList: tmpLesson ? tmpLesson.CheckList : lesson?.CheckList || [],
      PupilList: tmpLesson ? tmpLesson.PupilList : pupils,
      RecordingName: tmpLesson ? tmpLesson.RecordingName : "",
      RecordedLessonName: tmpLesson ? tmpLesson.RecordedLessonName : "",
      ChatTranscript: tmpLesson ? tmpLesson.ChatTranscript : "",
      QBDilogID: tmpLesson ? tmpLesson.QBDilogID : lesson?.QBDilogID,
      MaterialList: tmpLesson ? tmpLesson.MaterialList : materialList,
      RecordingList: tmpLesson ? tmpLesson.RecordingList : recordingList,
      ChannelList: tmpLesson
        ? tmpLesson.ChannelList
        : lesson?.ChannelList || [],
    };
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setFrmSubmitting(true);
    let pupils: any = [];
    if (values.PupilList.length) {
      pupils = values.PupilList.map((p) => {
        return { PupilId: p.value };
      });
    }
    let materialName: any = [];
    if (values.MaterialList.length) {
      materialName = values.MaterialList.filter(
        (m) => m.isNew !== undefined
      ).map((m) => {
        return { MaterialName: m.filename };
      });
    }

    const materialList = values.MaterialList.filter(
      (m) => m.isNew !== undefined
    ).map((m) => {
      return m.content;
    });
    const recordingList = values.RecordingList.filter(
      (r) => r.isNew !== undefined
    ).map((r) => {
      return r.file;
    });

    const removeRecordingList = removeRecording.map((r) => {
      const fileName = r.filename.split("/");
      return fileName[2];
    });
    const removeMaterialList = removeMaterial.map((m) => {
      const fileName = m.filename.split("/");
      return fileName[2];
    });
    const params: LessonParam = {
      SubjectId: values.SubjectId,
      LessonTopic: values.LessonTopic,
      LessonDate: moment(values.Date).format("YYYY-MM-DD"),
      LessonStartTime: values.StartTime,
      LessonEndTime: values.EndTime,
      PupilGroupId: values.PupilGroupId,
      LessonDescription: values.LessonDescription,
      RecordingName: values.RecordingName,
      RecordedLessonName: values.RecordedLessonName,
      ChatTranscript: values.ChatTranscript,
      IsDeliveredLive: values.LiveSession,
      IsPublishBeforeSesson: values.Publish,
      IsVotingEnabled: values.IsVotingEnabled,
      QBDilogID: values.QBDilogID,
      CreatedBy: user.id,
      PupilList: pupils,
      MaterialList: materialName,
      CheckList: values.CheckList,
      ChannelList: values.ChannelList,
    };

    if (params.QBDilogID) {
      QuickBlox.deleteDialog([params.QBDilogID], () => {});
    }
    await qbCreateDialog(params, values)
      .then(async (res) => {
        if (res) {
          params.QBDilogID = res._id;
        }
        let callback;
        if (lesson) {
          callback = lessonService.update(lesson.id, params);
        } else {
          callback = lessonService.add(params);
        }
        await callback
          .then(async (res) => {
            if (materialList.length || recordingList.length) {
              const uFile: LessonHomeworkFileParam = {};
              if (materialList.length) {
                uFile.materiallist = materialList;
              }
              if (recordingList.length) {
                uFile.recording = recordingList;
              }
              await lessonService
                .uploadFile(res.id, uFile)
                .then(() => {})
                .catch((e) => {});
            }
            if (removeRecordingList.length || removeMaterialList.length) {
              const dFile: DeleteLessonFileParam = {
                type: "L",
                deleterecording: [],
                deletematerial: [],
              };
              if (removeRecordingList.length) {
                dFile.deleterecording = removeRecordingList;
              }
              if (removeMaterialList.length) {
                dFile.deletematerial = removeMaterialList;
              }
              await lessonService
                .deleteFile(res.id, dFile)
                .then(() => {})
                .catch((e) => {});
            }
            navigate("/lesson/detail/" + res.id, {
              replace: true,
              state: { returnTo: "/lesson" },
            });
            setRemoveMaterial([]);
            setRemoveRecording([]);
          })
          .catch((e) => {
            if (e.type === "client") {
              setShowError(e.message);
            } else {
              setShowError("System error occurred!! please try again.");
            }
          });
      })
      .catch(() => {});
    setFrmSubmitting(false);
  };

  const qbCreateDialog = (lParams: any, sValues: any): Promise<any> => {
    return new Promise((resolve) => {
      if (lParams.IsDeliveredLive) {
        const subjectName = subject.filter((s) => s.id === lParams.SubjectId)[0]
          .SubjectName;
        const occupantsIds: any[] = [];
        const gPupilList = getSelectParticipant(lParams.PupilGroupId);
        if (gPupilList && gPupilList.pupilList.length) {
          gPupilList.pupilList.forEach((gp) => {
            if (gp.QBUserID) {
              occupantsIds.push(gp.QBUserID);
            }
          });
        }
        if (sValues.PupilList.length) {
          sValues.PupilList.forEach((p) => {
            if (p.QBUserID) {
              occupantsIds.push(p.QBUserID);
            }
          });
        }
        const qbDialogParams = {
          type: 2,
          name: `${subjectName} : ${lParams.LessonTopic}`,
          occupants_ids: occupantsIds,
        };
        QuickBlox.createDialog(qbDialogParams, (e, r) => {
          resolve(r);
        });
      } else {
        resolve(null);
      }
    });
  };

  const onValidate = (values) => {
    const subjectText = values.SubjectId
      ? subject.filter((s) => s.id === values.SubjectId)[0]
      : "";
    dataService.set("LESSON_TMP", { ...values, SubjectText: subjectText });
  };

  const formlik = () => {
    return {
      validationSchema: yup.object().shape({
        SubjectId: yup.string().required("Select lesson subject"),
        LessonTopic: yup.string().required("Pleae enter lesson topic"),
        Date: yup.string().nullable().required("Select date"),
        StartTime: yup
          .string()
          .when("LiveSession", {
            is: true,
            then: yup.string().required("Select form time"),
          })
          .test({
            test: (startTime, { parent }) => {
              const endTime = parent?.EndTime;
              if (startTime === undefined || endTime === undefined) {
                return true;
              }
              return !moment(startTime, "kk:mm").isSameOrAfter(
                moment(endTime, "kk:mm")
              );
            },
            message: "Select valid form time",
          }),
        EndTime: yup.string().when("LiveSession", {
          is: true,
          then: yup.string().required("Select end time"),
        }),
        PupilGroupId: yup.string().required("Select participants"),
        LessonDescription: yup
          .string()
          .required("Pleae enter lesson description"),
        CheckList: yup.array().of(
          yup.object().shape({
            ItemName: yup.string().required("It is required"),
          })
        ),
      }),
      initialValues: getInitialValues(),
      enableReinitialize: tmpLesson || lesson ? true : false,
      onSubmit: onSubmit,
      validate: onValidate,
    };
  };

  const uploadMaterial = (e) => {
    setFilenameShow(false);
    setMaterialError(null);
    const materialSchema = yup.object().shape({
      material: yup
        .mixed()
        .test(
          "fileFormat",
          "Invalid file, Upload valid csv, pdf, xls, doc and image",
          (value) => {
            return value && materialType.includes(value.type);
          }
        )
        .test("fileSize", "Please upload valid file", (value) => {
          return value && value.size >= 10;
        }),
    });
    materialSchema
      .validate({ material: e.target.files[0] })
      .then((res) => {
        setFileContent(res.material);
        setFilenameShow(true);
      })
      .catch((error) => {
        setMaterialError(error.message);
        setTimeout(() => setMaterialError(null), 2000);
      })
      .finally(() => {
        e.target.value = "";
      });
  };

  // const getThumbe = (channel: any) => {
  //   return `https://img.youtube.com/vi/${channel.videoId}/mqdefault.jpg`;
  // };

  return (
    <>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast
          onClose={() => {
            setShowError(null);
            setShowSuccess(null);
          }}
          bg={showSuccess ? "success" : showError ? "danger" : ""}
          show={!!showError || !!showSuccess}
          delay={3000}
          autohide
        >
          {showError ? (
            <Toast.Header closeButton={true}>
              <strong className="me-auto">Error</strong>
            </Toast.Header>
          ) : null}
          <Toast.Body>
            {showError}
            {showSuccess}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="app-lesson-addedit">
        <Formik {...formlik()}>
          {({
            handleSubmit,
            handleChange,
            touched,
            values,
            setValues,
            setFieldValue,
            setFieldTouched,
            isSubmitting,
            errors,
          }) => (
            <>
              <Form ref={formRef} onSubmit={handleSubmit}>
                <Row>
                  <Col lg={9} md={12}>
                    <div className="lesson-left">
                      <div className="class-detail">
                        <label className="title-line">
                          <span>Class details</span>
                        </label>
                        <Row>
                          <Col md={5} className="mb-30 lesson-subject">
                            <Form.Label htmlFor="SubjectId">Subject</Form.Label>
                            <Form.Select
                              id="SubjectId"
                              aria-label="Subject"
                              name="SubjectId"
                              disabled={isSubmitting}
                              onChange={handleChange}
                              value={values.SubjectId}
                              isValid={touched.SubjectId && !errors.SubjectId}
                              isInvalid={!!errors.SubjectId}
                            >
                              <option value="">
                                {subjectLoading
                                  ? "Loading ..."
                                  : subjectError
                                  ? `Error: ${subjectError}`
                                  : "Select subject"}
                              </option>
                              {subject.map((s, i) => {
                                return (
                                  <option key={i} value={s.id}>
                                    {s.SubjectName}
                                  </option>
                                );
                              })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.SubjectId}
                            </Form.Control.Feedback>
                          </Col>
                          <Col md={7} className="mb-30 lesson-topic">
                            <Form.Label htmlFor="LessonTopic">
                              Lesson Topic
                            </Form.Label>
                            <Form.Control
                              id="LessonTopic"
                              type="text"
                              placeholder="Lesson Topic"
                              name="LessonTopic"
                              disabled={isSubmitting}
                              onChange={handleChange}
                              value={values.LessonTopic}
                              isValid={
                                touched.LessonTopic && !errors.LessonTopic
                              }
                              isInvalid={!!errors.LessonTopic}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.LessonTopic}
                            </Form.Control.Feedback>
                          </Col>
                        </Row>
                      </div>
                      <Row>
                        <Col className="mb-30 d-flex">
                          <div className="class-setting">
                            <ul>
                              <li>
                                Will this lesson be delivered live
                                <Form.Check
                                  name="LiveSession"
                                  checked={values.LiveSession}
                                  onChange={handleChange}
                                  disabled={isSubmitting}
                                  className="success ml-1"
                                  type="switch"
                                />
                              </li>
                            </ul>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4} sm={12} className="mb-30 lesson-date">
                          <Form.Label htmlFor="Date">Date</Form.Label>
                          <DatePicker
                            minimumDate={new Date()}
                            date={values.Date}
                            onDateChange={(d) => {
                              const date: any = d;
                              setValues((prevValues) => {
                                prevValues.Date = date;
                                return prevValues;
                              });
                            }}
                            locale={enGB}
                            format="dd/MM/yyyy"
                          >
                            {({ inputProps, focused }) => (
                              <Form.Control
                                id="Date"
                                name="Date"
                                className={
                                  "date-picker-input input" +
                                  (focused ? "-focused" : "")
                                }
                                {...inputProps}
                                isValid={touched.Date && !errors.Date}
                                isInvalid={!!errors.Date}
                                disabled={isSubmitting}
                              />
                            )}
                          </DatePicker>
                          {errors.Date ? (
                            <>
                              <div className="invalid-feedback d-block">
                                {errors.Date}
                              </div>
                            </>
                          ) : null}
                        </Col>
                        {values.LiveSession ? (
                          <>
                            <Col md={4} sm={12} className="mb-30 lesson-time">
                              <Row>
                                <Col>
                                  <Form.Label htmlFor="StartTime">
                                    Form Time
                                  </Form.Label>
                                  <div className="select-icon">
                                    <Form.Select
                                      id="StartTime"
                                      aria-label="StartTime"
                                      name="StartTime"
                                      onChange={handleChange}
                                      disabled={isSubmitting}
                                      value={values.StartTime}
                                      isValid={
                                        touched.StartTime && !errors.StartTime
                                      }
                                      isInvalid={!!errors.StartTime}
                                    >
                                      <option value="">Select</option>
                                      {times.map((time, i) => {
                                        return (
                                          <option
                                            key={i}
                                            value={time.time24Hour}
                                          >
                                            {time.time}
                                          </option>
                                        );
                                      })}
                                    </Form.Select>
                                  </div>
                                  {errors.StartTime ? (
                                    <>
                                      <div className="invalid-feedback d-block">
                                        {errors.StartTime}
                                      </div>
                                    </>
                                  ) : null}
                                </Col>
                                <Col>
                                  <Form.Label htmlFor="EndTime">
                                    To Time
                                  </Form.Label>
                                  <div className="select-icon">
                                    <Form.Select
                                      id="EndTime"
                                      aria-label="EndTime"
                                      name="EndTime"
                                      onChange={handleChange}
                                      disabled={isSubmitting}
                                      value={values.EndTime}
                                      isValid={
                                        touched.EndTime && !errors.EndTime
                                      }
                                      isInvalid={!!errors.EndTime}
                                    >
                                      <option value="">Select</option>
                                      {times.map((time, i) => {
                                        return (
                                          <option key={i} value={time.to24Hour}>
                                            {time.to}
                                          </option>
                                        );
                                      })}
                                    </Form.Select>
                                  </div>
                                  {errors.EndTime ? (
                                    <>
                                      <div className="invalid-feedback d-block">
                                        {errors.EndTime}
                                      </div>
                                    </>
                                  ) : null}
                                </Col>
                              </Row>
                            </Col>
                          </>
                        ) : null}
                        <Col
                          md={4}
                          sm={12}
                          className="mb-30 lesson-participants"
                        >
                          <Form.Label htmlFor="PupilGroupId">
                            Participants
                          </Form.Label>
                          <div className="select-icon">
                            <Form.Select
                              id="PupilGroupId"
                              aria-label="LessonStop"
                              name="PupilGroupId"
                              onChange={async (e) => {
                                handleChange(e);
                                setTimeout(
                                  () =>
                                    changeParticipant(
                                      e.target.value,
                                      setValues
                                    ),
                                  100
                                );
                              }}
                              disabled={isSubmitting}
                              value={values.PupilGroupId}
                              isValid={
                                touched.PupilGroupId && !errors.PupilGroupId
                              }
                              isInvalid={!!errors.PupilGroupId}
                            >
                              <option value="">
                                {ppLoading
                                  ? "Loading ..."
                                  : ppError
                                  ? `Error: ${ppError}`
                                  : "Select"}
                              </option>
                              {participants.map((participant, i) => {
                                return (
                                  <option key={i} value={participant.id}>
                                    {participant.GroupName}
                                  </option>
                                );
                              })}
                            </Form.Select>
                          </div>
                          {errors.PupilGroupId ? (
                            <>
                              <div className="invalid-feedback d-block">
                                {errors.PupilGroupId}
                              </div>
                            </>
                          ) : null}
                        </Col>
                      </Row>
                      <Row className="mb-30">
                        <div className="lesson-description">
                          <Form.Label htmlFor="LessonDescription">
                            Lesson Description
                          </Form.Label>
                          <Form.Control
                            id="LessonDescription"
                            as="textarea"
                            placeholder="Lesson Description"
                            onChange={handleChange}
                            disabled={isSubmitting}
                            value={values.LessonDescription}
                            isValid={
                              touched.LessonDescription &&
                              !errors.LessonDescription
                            }
                            isInvalid={!!errors.LessonDescription}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.LessonDescription}
                          </Form.Control.Feedback>
                          {values.RecordingList.map((item, i) => {
                            const title =
                              item.isNew !== undefined
                                ? item.filename
                                : item.originalname;
                            return (
                              <div key={i} className="lesson-recording mr-1">
                                <Link
                                  key={i}
                                  to="#"
                                  onClick={() => {
                                    setPlayerContent(item);
                                    setPlayerShow(true);
                                  }}
                                >
                                  <Image
                                    src="/assets/images/svg/video-icon.svg"
                                    alt={title}
                                  />
                                  {title}
                                </Link>
                                <ImCross
                                  onClick={() => {
                                    if (item.isNew === undefined) {
                                      setRemoveRecording((prevRecording) => {
                                        return [...prevRecording, ...[item]];
                                      });
                                    }
                                    setValues((prevValues) => {
                                      prevValues.RecordingList.splice(i, 1);
                                      return prevValues;
                                    });
                                  }}
                                  to="#"
                                  className="ml-1 text-danger"
                                />
                              </div>
                            );
                          })}
                          <Recording
                            getRecording={(recording) => {
                              setValues((prevValues) => {
                                recording.file = new File(
                                  [recording.content],
                                  `${recording.filename}.mp4`,
                                  { type: "video/mp4" }
                                );
                                prevValues.RecordingList.push({
                                  ...recording,
                                  isNew: true,
                                });
                                return prevValues;
                              });
                            }}
                          />
                        </div>
                      </Row>
                      <Row className="mb-30">
                        <div className="lesson-class-detail">
                          <label className="title-line">
                            <span>Items your class may need</span>
                          </label>
                          <FieldArray name="CheckList">
                            {({ push, remove }) => (
                              <>
                                <ul>
                                  {values.CheckList.map((item, i) => {
                                    const isTouched = getIn(
                                      touched,
                                      `CheckList[${i}].ItemName`
                                    );
                                    const isError = getIn(
                                      errors,
                                      `CheckList[${i}].ItemName`
                                    );
                                    return (
                                      <li className="input-area" key={i}>
                                        <div className="frm-input">
                                          <Form.Control
                                            type="text"
                                            name={`CheckList[${i}].ItemName`}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            value={item.ItemName}
                                            isValid={isTouched && !isError}
                                            isInvalid={!!isError}
                                          />
                                          <Form.Control.Feedback type="invalid">
                                            {isError}
                                          </Form.Control.Feedback>
                                        </div>
                                        <Link
                                          onClick={() => remove(i)}
                                          to="#"
                                          className="ml-1 text-danger"
                                        >
                                          <ImCross />
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                                <Link
                                  onClick={() => push({ ItemName: "" })}
                                  className="add-item"
                                  to="#"
                                >
                                  <BsPlusLg /> Add another item
                                </Link>
                              </>
                            )}
                          </FieldArray>
                        </div>
                      </Row>
                      <Row className="mb-30">
                        <div className="individual-pupils">
                          <label className="title-line">
                            <span>Individual pupils</span>
                          </label>
                          <div>
                            <Select
                              classNamePrefix="auto-select"
                              closeMenuOnSelect={false}
                              isMulti
                              isDisabled={isSubmitting}
                              isLoading={allPupilLoading}
                              noOptionsMessage={() =>
                                allPupilError
                                  ? `Error: ${allPupilError}`
                                  : "No Pupil"
                              }
                              placeholder="Enter pupil name"
                              options={pupilList}
                              onChange={(options) =>
                                setFieldValue("PupilList", options)
                              }
                              onBlur={() => setFieldTouched("PupilList", true)}
                              value={values.PupilList}
                            />
                          </div>
                        </div>
                      </Row>
                      <Row className="mb-30">
                        <div className="class-setting">
                          <label className="title-line">
                            <span>Class Settings</span>
                          </label>
                          <ul>
                            <li>
                              Publish lesson before live lesson
                              <Form.Check
                                name="Publish"
                                checked={values.Publish}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="success"
                                type="switch"
                              />
                            </li>
                          </ul>
                        </div>
                      </Row>
                    </div>
                  </Col>
                  <Col lg={3} md={12}>
                    <div className="lesson-right">
                      <div className="learning-material">
                        <h2>Learning material</h2>
                        {/* <p>Drop links, videos, or documents here or find relevant materials with our clever AI</p> */}
                        <div className="app-fileuploader">
                          <Form.Control
                            name="Material"
                            type="file"
                            onChange={(e: any) => {
                              uploadMaterial(e);
                            }}
                            disabled={isSubmitting}
                            isValid={!materialError}
                            isInvalid={!!materialError}
                          />
                          <Form.Control.Feedback type="invalid">
                            {materialError}
                          </Form.Control.Feedback>
                        </div>
                        <ul className="learning-material-inner">
                          {values.MaterialList.map((item, i) => {
                            const title =
                              item.isNew !== undefined
                                ? item.filename
                                : item.originalname;
                            const dObj = {
                              url: GetUrl(item.filename, "server"),
                              filename: item.originalname,
                            };
                            return (
                              <li key={i}>
                                <Link to="#">
                                  {dLoading &&
                                  dFile &&
                                  dFile.url === dObj.url ? (
                                    <Spinner
                                      animation="border"
                                      variant="primary"
                                      size="sm"
                                    />
                                  ) : (
                                    <span onClick={() => download(dObj)}>
                                      {title}
                                    </span>
                                  )}
                                  <ImCross
                                    onClick={() => {
                                      if (item.isNew === undefined) {
                                        setRemoveMaterial((prevMaterial) => {
                                          return [...prevMaterial, ...[item]];
                                        });
                                      }
                                      setValues((prevValues) => {
                                        prevValues.MaterialList.splice(i, 1);
                                        return prevValues;
                                      });
                                    }}
                                  />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="video-material">
                          {values.ChannelList ? (
                            <div className="video-image">
                              <Scrollbars
                                className="scrollbars"
                                style={{
                                  width: "100%",
                                  height: values.ChannelList.length
                                    ? "150px"
                                    : "",
                                }}
                              >
                                <ul>
                                  {values.ChannelList.map((item, key) => {
                                    return (
                                      <li key={key}>
                                        <div className="video-thumb"></div>
                                        <div className="action-title">
                                          <Link to="#">
                                            {/* <Image
                                            // src={getThumbe(item)}
                                            src='/assets/images/svg/video-thumb.svg'
                                            alt="BBC Bitesize"
                                          /> */}
                                            <span>{item.Title}</span>
                                          </Link>
                                          <span
                                            className="cross"
                                            onClick={() => {
                                              setValues((prevValues) => {
                                                prevValues.ChannelList.splice(
                                                  key,
                                                  1
                                                );
                                                return prevValues;
                                              });
                                            }}
                                          >
                                            <ImCross />
                                          </span>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </Scrollbars>
                            </div>
                          ) : null}
                          {values.SubjectId && values.LessonTopic ? (
                            <Link
                              to="/lesson/material"
                              state={{ returnTo: paths }}
                              className="find-meterial"
                            >
                              find me learning material
                            </Link>
                          ) : null}
                        </div>
                        {/* <h2>View lesson recording</h2>
                        <Link to="#" className="lesson-recording">
                          <Image src="/assets/images/svg/video-icon.svg" alt="Lesson Recording" />Lesson Recording
                        </Link>
                        <h2>Chat transcript</h2>
                        <ul className="learning-material-inner">
                          <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                          <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                          <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                          <li><Link to="#">Filename <Image src="/assets/images/svg/download.svg" alt="Download File" /></Link></li>
                        </ul> */}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form>
              {filenameShow ? (
                <FileName
                  content={fileContent}
                  onSubmit={async (material: any) => {
                    material.filename = material.filename.trim();
                    setValues((prevValues) => {
                      prevValues.MaterialList.push({
                        ...material,
                        isNew: true,
                      });
                      return prevValues;
                    });
                    setFilenameShow(false);
                  }}
                  handleClose={setFilenameShow}
                  heading="Material Title"
                />
              ) : null}
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
            </>
          )}
        </Formik>
      </div>
    </>
  );
}

export default AddEdit;
