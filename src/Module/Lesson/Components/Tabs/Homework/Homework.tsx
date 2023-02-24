import React, { useEffect } from "react";
import * as yup from "yup";
import PropTypes from "prop-types";
import { Lesson } from "../../../../../Services/LessonService";
import {
  Col,
  Form,
  InputGroup,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { enGB } from "date-fns/locale";
import { DatePicker } from "react-nice-dates";
import { BsPlusLg } from "react-icons/bs";
import { useStateMounted, useVisibility } from "../../../../../Core/Hooks";
import { ImCross } from "react-icons/im";
import { FieldArray, Formik, getIn } from "formik";
import { Image } from "../../../../../Components";
import { FileName, Recording } from "../../../../../Components/Popup";
import moment from "moment";
import {
  DeleteHomeworkFileParam,
  HomeworkService,
  LessonHomework,
  LessonHomeworkFileParam,
  LessonHomeworkParam,
} from "../../../../../Services/HomeworkService";
import "./Homework.scss";
import { useAuth } from "../../../../../Core/Providers";
import Player from "../../../../../Components/Popup/Player";
import Scrollbars from "react-custom-scrollbars";
import { DataStore } from "../../../../../Core/Services/DataService";

type HomeworkProps = {
  utype: string;
  lesson: Lesson;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmit: (val: boolean) => void;
};

function Homework(props: HomeworkProps) {
  const dataService = DataStore;
  const navigate = useNavigate();
  const location = useLocation();
  const { lesson, utype, formRef, isSubmit } = props;
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [showSuccess, setShowSuccess] = useStateMounted<string | null>(null);
  const [eleRef, isVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [isEdit, setIsEdit] = useStateMounted(false);
  const [lessonHomework, setLessonHomework] = useStateMounted<LessonHomework>();
  const [filenameShow, setFilenameShow] = useStateMounted(false);
  const [fileContent, setFileContent] = useStateMounted();
  const [playerShow, setPlayerShow] = useStateMounted(false);
  const [playerContent, setPlayerContent] = useStateMounted<any>();
  const [materialError, setMaterialError] = useStateMounted<string | null>(
    null
  );
  const [removeRecording, setRemoveRecording] = useStateMounted<any[]>([]);
  const [removeMaterial, setRemoveMaterial] = useStateMounted<any[]>([]);
  const [tmpHomework, setTmpHomework] = useStateMounted<any>();
  const homeworkService = new HomeworkService();
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


  useEffect(() => {
    setIsEdit(utype === "teacher" ? true : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  useEffect(() => {
    (async () => {
      await dataService
        .get("HOMEWORK_TMP")
        .then((tmpData) => setTmpHomework(tmpData));
      getLessonHomework();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLessonHomework = async () => {
    await homeworkService
      .getByLessonID(lesson.id)
      .then((res) => {
        setLessonHomework(res);
      })
      .catch((e) => {});
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
  useEffect(() => {
    dataService.set("HOMEWORK_TMP", lessonHomework);
  }, [lessonHomework]);

  useEffect(() => {
    if (tmpHomework) {
      dataService.set("HOMEWORK_TMP", tmpHomework);
    }
  }, [tmpHomework]);


  useEffect(() => {
    if (lesson) {
      const SubjectData = {
        Subject: lesson.SubjectName,
        Topic: lesson.LessonTopic,
      };
      dataService.set("HOMEWORK_TMP", {
        ...lessonHomework,
        SubjectText: SubjectData,
      });
    }
  }, [lesson, lessonHomework]);

  const getInitialValues = () => {
    const checkList: any = lessonHomework?.CheckList || [];
    const dueDate: any = moment(lessonHomework?.DueDate).toDate();
    let materialList: any = lessonHomework?.MaterialList || [];
    let recordingList: any = lessonHomework?.RecordingList || [];
    const tmpdate :any = moment(tmpHomework?.DueDate ).toDate();
    return {
      IsIncluded: tmpHomework
        ? tmpHomework.IsIncluded
        : lessonHomework?.IsIncluded
        ? true
        : false,
      HomeworkDescription: tmpHomework
        ? tmpHomework.HomeworkDescription
        : lessonHomework?.HomeworkDescription,
      DueDate: tmpHomework ? tmpdate : dueDate,
      CheckList: tmpHomework ? tmpHomework.CheckList : checkList,
      RecordingList: tmpHomework ? tmpHomework.RecordingList : recordingList,
      MaterialList: tmpHomework ? tmpHomework.MaterialList : materialList,
      ChannelList: tmpHomework
        ? tmpHomework.ChannelList
        : lessonHomework?.ChannelList || [],
    };
  };


  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    isSubmit(true);
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
    const params: LessonHomeworkParam = {
      LessonId: lesson.id,
      IsIncluded: values.IsIncluded,
      DueDate: moment(values.DueDate).format("YYYY-MM-DD"),
      HomeworkDescription: values.HomeworkDescription,
      CreatedBy: user.id,
      CheckList: values.CheckList,
      ChannelList: values.ChannelList,
    };
    let callback;
    if (lessonHomework) {
      callback = homeworkService.update(lessonHomework.id, params);
    } else {
      callback = homeworkService.add(params);
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
          await homeworkService
            .uploadFile(res.id, uFile)
            .then(() => {})
            .catch((e) => {});
        }
        if (removeRecordingList.length || removeMaterialList.length) {
          const dFile: DeleteHomeworkFileParam = {
            type: "H",
            deleterecording: [],
            deletematerial: [],
          };
          if (removeRecordingList.length) {
            dFile.deleterecording = removeRecordingList;
          }
          if (removeMaterialList.length) {
            dFile.deletematerial = removeMaterialList;
          }
          await homeworkService
            .deleteFile(res.id, dFile)
            .then(() => {})
            .catch((e) => {});
        }
        setShowSuccess(
          lessonHomework
            ? "Homework update successfully."
            : "Homework add successfully"
        );
        await getLessonHomework();
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
    isSubmit(false);
  };
  const onValidate = (values) => {
    const SubjectData = {
      Subject: lesson.SubjectName,
      Topic: lesson.LessonTopic,
    };
    dataService.set("HOMEWORK_TMP", { ...values, SubjectText: SubjectData });
  };

  const formlik = () => {
    return {
      validationSchema: yup.object().shape({
        HomeworkDescription: yup
          .string()
          .required("Please enter homework description"),
        DueDate: yup
          .string()
          .nullable()
          .required("Please enter Homework due date"),
        CheckList: yup.array().of(
          yup.object().shape({
            ItemName: yup.string().required("It is required"),
          })
        ),
      }),
      initialValues: getInitialValues(),
      enableReinitialize: tmpHomework || lessonHomework ? true : false,
      onSubmit: onSubmit,
      validate: onValidate,
    };
  };

  return lesson ? (
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
      <Formik {...formlik()}>
        {({
          handleSubmit,
          handleChange,
          touched,
          values,
          setValues,
          isSubmitting,
          errors,
        }) => (
          <>
            <Form
              ref={formRef}
              onSubmit={handleSubmit}
              className={!isEdit ? "form-not-edit" : ""}
            >
              <Row className="lesson-homework">
                <Col lg={9} md={12}>
                  <div className="lesson-homework-leftbar">
                    <Row>
                      <Col md={6} sm={12} className="mb-30">
                        <InputGroup>
                          <InputGroup.Text>Include homework</InputGroup.Text>
                          <div className="form-control br-lw-0">
                            <div className="toggle-switch">
                              <Form.Check
                                disabled={!isEdit || isSubmitting}
                                className="success"
                                name="IsIncluded"
                                checked={values.IsIncluded}
                                onChange={handleChange}
                                type="switch"
                              />
                            </div>
                          </div>
                        </InputGroup>
                      </Col>
                      <Col md={6} sm={12} className="mb-30">
                        <InputGroup ref={eleRef}>
                          <InputGroup.Text>Due date</InputGroup.Text>
                          {isVisible ? (
                            <>
                              <DatePicker
                                minimumDate={new Date()}
                                date={values.DueDate}
                                onDateChange={(d) => {
                                  const dueDate: any = d;
                                  setValues((pValue) => {
                                    pValue.DueDate = dueDate;
                                    return pValue;
                                  });
                                }}
                                locale={enGB}
                                format="dd/MM/yyyy"
                              >
                                {({ inputProps, focused }) => (
                                  <>
                                    <Form.Control
                                      id="DueDate"
                                      name="DueDate"
                                      className={
                                        "date-picker-input br-lw-0 input" +
                                        (focused ? "-focused" : "")
                                      }
                                      isValid={
                                        touched.DueDate && !errors.DueDate
                                      }
                                      {...inputProps}
                                      isInvalid={!!errors.DueDate}
                                      disabled={!isEdit || isSubmitting}
                                    />
                                  </>
                                )}
                              </DatePicker>
                              {errors.DueDate ? (
                                <>
                                  <div className="invalid-feedback d-block">
                                    {errors.DueDate}
                                  </div>
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row className="mb-30">
                      <div className="lesson-description">
                        <Form.Label htmlFor="lesson-description">
                          Homework Description
                        </Form.Label>
                        <Form.Control
                          disabled={!isEdit || isSubmitting}
                          id="lesson-description"
                          name="HomeworkDescription"
                          rows={3}
                          as="textarea"
                          placeholder="Homework Description"
                          onChange={handleChange}
                          value={values.HomeworkDescription}
                          isValid={
                            touched.HomeworkDescription &&
                            !errors.HomeworkDescription
                          }
                          isInvalid={!!errors.HomeworkDescription}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.HomeworkDescription}
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
                              {isEdit ? (
                                <ImCross
                                  className="ml-1 text-danger"
                                  onClick={() => {
                                    setValues((prevValues) => {
                                      if (item.isNew === undefined) {
                                        setRemoveRecording((prevRecording) => {
                                          return [...prevRecording, ...[item]];
                                        });
                                      }
                                      prevValues.RecordingList.splice(i, 1);
                                      return prevValues;
                                    });
                                  }}
                                />
                              ) : null}
                            </div>
                          );
                        })}
                        {isEdit ? (
                          <>
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
                          </>
                        ) : null}
                      </div>
                    </Row>
                    <FieldArray name="CheckList">
                      {({ push, remove }) => (
                        <>
                          <Row className="mb-30">
                            <div className="lesson-class-detail">
                              <label className="title-line">
                                <span>Create Checklist </span>
                              </label>
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
                                    <li key={i}>
                                      <Form.Group
                                        className="checklist"
                                        controlId={`CheckList-${i}`}
                                      >
                                        <Form.Check
                                          name={`CheckList.${i}.IsCheck`}
                                          type="checkbox"
                                          checked={item.IsCheck}
                                          onChange={handleChange}
                                          disabled={true}
                                          // disabled={!isEdit || isSubmitting}
                                        />
                                        <div className="frm-input w-100 ml-1">
                                          <Form.Control
                                            type="text"
                                            placeholder=""
                                            name={`CheckList.${i}.ItemName`}
                                            onChange={handleChange}
                                            value={item.ItemName}
                                            isValid={isTouched && !isError}
                                            isInvalid={!!isError}
                                            disabled={!isEdit || isSubmitting}
                                          />
                                          <Form.Control.Feedback type="invalid">
                                            {isError}
                                          </Form.Control.Feedback>
                                        </div>
                                        {isEdit ? (
                                          <Link
                                            onClick={() => remove(i)}
                                            to="#"
                                            className="ml-1 text-danger"
                                          >
                                            <ImCross />
                                          </Link>
                                        ) : null}
                                      </Form.Group>
                                    </li>
                                  );
                                })}
                              </ul>
                              {isEdit ? (
                                <Link
                                  className="add-item"
                                  to="#"
                                  onClick={() =>
                                    push({ ItemName: "", IsCheck: false })
                                  }
                                >
                                  <BsPlusLg /> Add another item
                                </Link>
                              ) : null}
                            </div>
                          </Row>
                        </>
                      )}
                    </FieldArray>
                  </div>
                </Col>
                <Col lg={3} md={12}>
                  <div className="lesson-homework-rightbar">
                    <div className="learning-material">
                      <h2>Learning material</h2>
                      <div className="app-fileuploader">
                        <Form.Control
                          name="Material"
                          type="file"
                          onChange={(e: any) => {
                            uploadMaterial(e);
                          }}
                          isValid={!materialError}
                          isInvalid={!!materialError}
                          disabled={!isEdit || isSubmitting}
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
                          return (
                            <li key={i}>
                              <Link to="#">
                                {title}
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
                        {values.IsIncluded && values.DueDate ? (
                          <Link
                            to="/lesson/homework/material"
                            className="find-meterial"
                            state={{ returnTo: paths + '?tabs=lessonHomework' }}
                            
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
                    prevValues.MaterialList.push({ ...material, isNew: true });
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
    </>
  ) : null;
}

Homework.propTypes = {
  utype: PropTypes.string.isRequired,
  lesson: PropTypes.object.isRequired,
  formRef: PropTypes.any,
};

export default Homework;
