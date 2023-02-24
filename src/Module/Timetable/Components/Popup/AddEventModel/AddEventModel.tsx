import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../../../Core/Hooks';
import * as yup from 'yup';
import { Button, Col, Form, Row, Modal, ToastContainer, Toast } from 'react-bootstrap';
import { enGB } from 'date-fns/locale'
import { DatePicker } from 'react-nice-dates'
import { timeByStartEnd, TimeByStartEnd } from '../../../../../Core/Utility/Datetime';
import { Formik } from 'formik';
import moment from 'moment';
import { MyEventService, EventParam } from '../../../../../Services/EventService';
import Select from 'react-select';
import { useAuth } from '../../../../../Core/Providers';
import './AddEventModel.scss';

type AddEventModelProps = {
  show?: boolean;
  handleClose?: (event: boolean) => void;
  onRefresh: () => void;
} & typeof defaultProps;

const propTypes = {
  show: PropTypes.bool,
  onSubmit: PropTypes.func,
  handleClose: PropTypes.func,
  onRefresh: PropTypes.func
};

const defaultProps = {
  show: true
};

function AddEventModel(props: AddEventModelProps) {

  const { show, handleClose } = props;
  const [_show, setShow] = useStateMounted(show);
  const [times, setTimes] = useStateMounted<TimeByStartEnd[]>([]);
  const [eventType, setMyEventType] = useStateMounted<any[]>([]);
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const myEventService = new MyEventService();
  const user = useAuth().user();


  useEffect(() => {
    (async () => {
      setTimes(timeByStartEnd('06:00 AM', '24:00 AM', 30));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    (async () => {
      await getMyEventType();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getMyEventType = async () => {
    await myEventService.eventType()
      .then((res) => {
        const data = res.map((e) => {
          return {
            value: e.id,
            label: <>
              <div className="color-title-box">
                <span className='color-box' style={{ backgroundColor: e.EventColor, padding: "3px 15px", borderRadius: "0px" }}></span>
                <span className='type-box' style={{paddingLeft: "20px" }} >{e.EventType}</span>
              </div>
            </>
          };
        })
        setMyEventType(data);
      })
      .catch((err) => { });
  };

  const _handleClose = () => {
    setShow(false);
    if (handleClose) {
      handleClose(false)
    }
  }

  const getInitialValues = () => {
    const date: any = moment().toDate();
    return {
      EventName: '',
      Date: date,
      StartTime: '',
      EndTime: '',
      Location: '',
      Note: '',
      EventTypeId: '',
      CreatedBy: (user.userType.Type === 'teacher') ? user.id : user.UserDetialId || '',
    };
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    const payload: EventParam = {
      EventName: values.EventName,
      EventDate: moment(values.Date).format('YYYY-MM-DD'),
      EventStartTime: values.StartTime,
      EventEndTime: values.EndTime,
      EventLocation: values.Location,
      EventDescription: values.Note,
      EventTypeId: values.EventTypeId.value,
      Active: false,
      CreatedBy: values.CreatedBy,
    };
    await myEventService.addEvent(payload)
      .then(() => {
        props.onRefresh();
        _handleClose();
      })
      .catch((e) => {
        if (e.type === 'client') {
          setShowError(e.message);
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });

  };

  const formlik = {
    validationSchema: yup.object().shape({
      EventName: yup.string().required('Please enter Event Name'),
      Date: yup.string().nullable().required('Select date'),
      StartTime: yup.string().required('Select form time'),
      EndTime: yup.string().required('Select end time'),
      Location: yup.string().required('Enter location'),
      Note: yup.string(),
      EventTypeId: yup.object().required('Select Event Type')
    }),
    initialValues: getInitialValues(),
    onSubmit: onSubmit,
  };

  return (
    <Modal className="event-add-popup-model " show={_show} onHide={_handleClose}>
      <div className="add-event-popup">
        <ToastContainer className="p-3 position-fixed" position="top-center">
          <Toast onClose={() => setShowError(null)} bg="danger" show={!!showError} delay={3000} autohide>
            <Toast.Header closeButton={true}>
              <strong className="me-auto">Error</strong>
            </Toast.Header>
            <Toast.Body>{showError}</Toast.Body>
          </Toast>
        </ToastContainer>
        <div className='border-area' >
          <Modal.Header closeButton />
          <Modal.Body>
            <Formik {...formlik}>
              {
                ({ handleSubmit, handleChange, touched, values, setValues, setFieldValue, setFieldTouched, isSubmitting, errors }) => (
                  <Form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <h1>Add a calendar event</h1>
                      <Row className='mb-30'>
                        <Col>
                          <Form.Label htmlFor='EventName'>What is the event?</Form.Label>
                          <Form.Control id="EventName" type="text" placeholder="Event Name " name="EventName"
                            onChange={handleChange}
                            value={values.EventName}
                            isValid={touched.EventName && !errors.EventName}
                            isInvalid={!!errors.EventName} />
                          {
                            (errors.EventName)
                              ? <>
                                <div className='invalid-feedback d-block'>{errors.EventName}</div>
                              </>
                              : null
                          }
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4} sm={12} className="mb-30 lesson-date">
                          <Form.Label htmlFor='Date'>When is it?</Form.Label>
                          <DatePicker
                            date={values.Date}
                            minimumDate={new Date()}
                            onDateChange={(d) => {
                              const date: any = d;
                              setValues((prevValues) => {
                                prevValues.Date = date;
                                return prevValues;
                              });
                            }}
                            locale={enGB}
                            format='dd/MM/yyyy'>
                            {
                              ({ inputProps, focused }) => (
                                <Form.Control
                                  id="Date"
                                  name="Date"
                                  className={'date-picker-input input' + (focused ? '-focused' : '')}
                                  autoComplete="off"
                                  {...inputProps}
                                  isValid={touched.Date && !errors.Date}
                                  isInvalid={!!errors.Date}
                                />
                              )
                            }
                          </DatePicker>
                          {
                            (errors.Date)
                              ? <>
                                <div className='invalid-feedback d-block'>{errors.Date}</div>
                              </>
                              : null
                          }
                        </Col>
                        <Col className='mb-30'>
                          <Form.Label htmlFor='StartTime'>Form Time</Form.Label>
                          <div className="select-icon">
                            <Form.Select id="StartTime" aria-label="StartTime"
                              name="StartTime"
                              onChange={handleChange}
                              value={values.StartTime}
                              isValid={touched.StartTime && !errors.StartTime}
                              isInvalid={!!errors.StartTime}>
                              <option value="">Select</option>
                              {
                                times.map((time, i) => {
                                  return (
                                    <option
                                      key={i}
                                      value={time.time24Hour}>
                                      {time.time}
                                    </option>
                                  )
                                })
                              }
                            </Form.Select>
                          </div>
                          {
                            (errors.StartTime)
                              ? <>
                                <div className='invalid-feedback d-block'>{errors.StartTime}</div>
                              </>
                              : null
                          }
                        </Col>
                        <Col className='mb-30'>
                          <Form.Label htmlFor='EndTime'>To Time</Form.Label>
                          <div className="select-icon">
                            <Form.Select id="EndTime" aria-label="EndTime"
                              name="EndTime"
                              onChange={handleChange}
                              value={values.EndTime}
                              isValid={touched.EndTime && !errors.EndTime}
                              isInvalid={!!errors.EndTime}
                            >
                              <option value="">Select</option>
                              {
                                times.map((time, i) => {
                                  return (
                                    <option
                                      key={i}
                                      value={time.to24Hour}>
                                      {time.to}
                                    </option>
                                  )
                                })
                              }
                            </Form.Select>
                          </div>
                          {
                            (errors.EndTime)
                              ? <>
                                <div className='invalid-feedback d-block'>{errors.EndTime}</div>
                              </>
                              : null
                          }
                        </Col>
                      </Row>
                      <Row className='mb-30'>
                        <Col>
                          <Form.Label htmlFor='Location'>Where?</Form.Label>
                          <Form.Control id="Location" type="text" placeholder="Location" name="Location"
                            onChange={handleChange}
                            value={values.Location}
                            isValid={touched.Location && !errors.Location}
                            isInvalid={!!errors.Location} />
                          {
                            (errors.Location)
                              ? <>
                                <div className='invalid-feedback d-block'>{errors.Location}</div>
                              </>
                              : null
                          }
                        </Col>
                      </Row>
                      <Row className='mb-30'>
                        <div className="lesson-description">
                          <Form.Label htmlFor='Note'>Notes</Form.Label>
                          <div className="note-color-peaker">
                            <div className="note">
                              <Form.Control id="Note" placeholder="Note"
                                onChange={handleChange}
                                value={values.Note}
                                isValid={touched.Note && !errors.Note}
                                isInvalid={!!errors.Note} /></div> <div className="color-peaker"> <Select
                                  closeMenuOnSelect={true}
                                  isDisabled={isSubmitting}
                                  onChange={(options) => setFieldValue('EventTypeId', options)}
                                  onBlur={() => setFieldTouched('EventTypeId', true)}
                                  noOptionsMessage={() => "No event"}
                                  placeholder="Select Event Type"
                                  options={eventType}
                                  value={values.EventTypeId}
                                />
                              {
                                (errors.EventTypeId)
                                  ? <>
                                    <div className='invalid-feedback d-block'>{errors.EventTypeId}</div>
                                  </>
                                  : null
                              }
                            </div>
                          </div>
                        </div>
                      </Row>
                      <Row className='submit-btn'>
                        <Button className="mr-1 save-btn" variant="success" type="submit"> Add to calender</Button>
                      </Row>
                    </div>
                  </Form>
                )}
            </Formik>
          </Modal.Body>
        </div>
      </div>
    </Modal>
  );
}

AddEventModel.propTypes = propTypes;

AddEventModel.defaultProps = defaultProps;

export default AddEventModel;





