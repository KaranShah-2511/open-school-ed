import React, { useEffect } from 'react';
import { Button, Col, Form, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import Scrollbars from "react-custom-scrollbars";
import { HiOutlinePencil } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { Image } from '../../../../Components';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import ImgDropable from '../../../../Assets/Images/Svg/dropable-image.svg';
import ImgRemove from '../../../../Assets/Images/Svg/close-small.svg';
import { ClassSetupList, ClassSetupParam, Pupil, PupilService } from '../../../../Services/PupilService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Teacher, TeacherService } from '../../../../Services/TeacherService';
import './ClassSetup.scss';

function ClassSetup() {

  const [dragDropState, setDragDropState] = useStateMounted<{ items: Pupil[], selected: Pupil[] }>({ items: [], selected: [] });
  const dragDropIdList = {
    droppable: 'items',
    droppable2: 'selected'
  };

  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [showSuccess, setShowSuccess] = useStateMounted<string | null>(null);
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [psError, setPsError] = useStateMounted<string | null>(null);
  const [csLoading, setCsLoading] = useStateMounted<boolean>(true);
  const [csError, setCsError] = useStateMounted<string | null>(null);
  const [selectClassSetup, setSelectClassSetup] = useStateMounted<ClassSetupList | null>();
  const [classSetupList, setClassSetupList] = useStateMounted<ClassSetupList[]>([]);
  const [pcsLoading, setPcsLoading] = useStateMounted<boolean>(true);
  const [pcsError, setPcsError] = useStateMounted<string | null>(null);
  const [pupilClassSetupList, setPupilClassSetupList] = useStateMounted<Pupil[]>([]);
  const [tLoading, setTLoading] = useStateMounted<boolean>(true);
  const [selectTeacher, setSelectTeacher] = useStateMounted<string | number>('');
  const [focusTeacher, setFocusTeacher] = useStateMounted<boolean>(false);
  const [teachers, setTeachers] = useStateMounted<Teacher[]>([]);
  const pupilService = new PupilService();
  const teacherService = new TeacherService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getClassSetupList();
      getPupilClassSetupList();
      getTeachers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pupilClassSetupList.length) {
      setDragDropState((pstate) => {
        return { ...pstate, items: pupilClassSetupList }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pupilClassSetupList]);

  useEffect(() => {
    if (selectClassSetup) {
      setPsError(null);
      setSelectTeacher(selectClassSetup.TeacherId);
      if (selectClassSetup.pupilList && selectClassSetup.pupilList.length) {
        const selected: any = [];
        const items = pupilClassSetupList.filter((item) => {
          const match = selectClassSetup.pupilList.filter((csp) => item.id === csp.PupilId);
          if (match.length) {
            selected.push(item);
            return false;
          } else {
            return true;
          }
        });
        setDragDropState({ items: items, selected: selected });
      }
    } else {
      setSelectTeacher('');
      setDragDropState({ items: pupilClassSetupList, selected: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectClassSetup]);

  const getClassSetupList = async () => {
    setCsLoading(true);
    setCsError(null);
    await pupilService.classSetupListBySchoolID(user.UserDetialId)
      .then((res) => {
        setClassSetupList(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setCsError(e.message);
        } else {
          setCsError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setCsLoading(false);
      });
  };

  const getPupilClassSetupList = async () => {
    setPcsLoading(true);
    setPcsError(null);
    await pupilService.pupilClassSetupBySchoolID(user.UserDetialId)
      .then((res) => {
        setPupilClassSetupList(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setPcsError(e.message);
        } else {
          setPcsError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setPcsLoading(false);
      });
  };

  const getTeachers = async () => {
    setTLoading(true);
    await teacherService.getDropDownBySchoolID(user.UserDetialId)
      .then((res) => {
        setTeachers(res);
      })
      .catch((e) => { })
      .finally(() => {
        setTLoading(false);
      });
  };

  const onSubmit = async () => {
    setPsError(null);
    setFrmSubmitting(true);
    setFocusTeacher(true);
    if (!dragDropState.selected.length) {
      setPsError('Assign at least 1 pupil');
      setFrmSubmitting(false);
      return;
    }

    if (!selectTeacher) {
      setFrmSubmitting(false);
      return;
    }

    const addPupilList: any = dragDropState.selected.map((p) => { return { PupilId: p.PupilId }; });
    let removePupilList: any = [];
    if (selectClassSetup) {
      removePupilList = (selectClassSetup.pupilList.length)
        ? selectClassSetup.pupilList
          .filter((p) => !(addPupilList.filter((cp) => p.PupilId === cp.PupilId).length))
          .map((p) => { return { PupilId: p.PupilId }; })
        : removePupilList;
    }

    const params: ClassSetupParam = {
      SchoolId: user.UserDetialId,
      TeacherId: selectTeacher,
      CreatedBy: user.UserDetialId,
      PupilList: addPupilList,
      RemovePupilList: removePupilList
    };

    await pupilService.classSetupSave(params)
      .then(async (res) => {
        setShowSuccess('Class Setup successfully.');
        setSelectClassSetup(null);
        setFocusTeacher(false);
        setSelectTeacher('');
        getClassSetupList();
        setDragDropState({ items: pupilClassSetupList, selected: [] });
      })
      .catch((e) => {
        if (e.type === 'client') {
          setShowError(e.message);
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });
    setFrmSubmitting(false);
  };

  const changeTeacher = (e) => {
    if (e.target.value && classSetupList && classSetupList.length) {
      const csitem = classSetupList.filter((cs) => cs.TeacherId === e.target.value);
      if (csitem.length) {
        setSelectClassSetup(csitem[0]);
      } else {
        setSelectTeacher(e.target.value);
      }
    } else {
      setSelectTeacher(e.target.value);
    }
  }

  // Drag Drop 

  const reorderItem = (list, startIndex, endIndex): any[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const moveItem = (source, destination, droppableSource, droppableDestination): any => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    ...draggableStyle
  });

  const getListStyle = isDraggingOver => ({});

  const getList = id => dragDropState[dragDropIdList[id]];

  const onDragEnd = (result: any) => {
    setPsError(null);
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorderItem(
        getList(source.droppableId),
        source.index,

        destination.index
      );

      if (source.droppableId === 'droppable2') {
        setDragDropState((pstate) => {
          return { ...pstate, selected: items }
        });
      } else {
        setDragDropState((pstate) => {
          return { ...pstate, items: items }
        });
      }

    } else {
      const result = moveItem(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
      );
      setDragDropState({
        items: result.droppable,
        selected: result.droppable2
      });
    }
  };

  const onDelete = (index) => {
    const result = {
      source: {
        droppableId: "droppable2",
        index: index
      },
      destination: {
        droppableId: "droppable",
        index: dragDropState.items.length
      }
    }
    onDragEnd(result);
  };

  return (
    <>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast
          onClose={() => { setShowError(null); setShowSuccess(null); }}
          bg={(showSuccess) ? 'success' : ((showError) ? 'danger' : '')}
          show={(!!showError || !!showSuccess)}
          delay={3000} autohide>
          {(showError) ? <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header> : null}
          <Toast.Body>
            {showError}
            {showSuccess}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <div className='pupil-class-setup'>
        <Row>
          <Col lg={9} sm={12}>
            <div className="drop-list">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="pupil-list">
                  <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 'calc(100vh - 165px)' }}>
                    <Droppable isDragDisabled={frmSubmitting} droppableId="droppable">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}>
                          {(pcsLoading) ? <div className='loading'>Loading ... <Spinner animation="grow" size="sm" /></div> : null}
                          {(pcsError) ? <div className='error'>{pcsError}</div> : null}
                          {
                            (!pcsLoading && !pcsError && (dragDropState.items && dragDropState.items.length === 0))
                              ? <div className='not-data'>Not record found</div>
                              : null
                          }
                          {dragDropState.items.map((item, index) => (
                            <Draggable
                              isDragDisabled={frmSubmitting}
                              key={item.id}
                              draggableId={item.id}
                              index={index}>
                              {(provided, snapshot) => (
                                <>
                                  <div
                                    className="pupil-unselected"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}>
                                    <span className="user-icon">
                                      <Image domain='server' src={item.ProfilePicture} alt={item.FullName} />
                                    </span>
                                    <span>{item.FullName}</span>
                                  </div>
                                </>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Scrollbars>
                </div>
                <Droppable isDragDisabled={frmSubmitting} droppableId="droppable2">
                  {(provided, snapshot) => (
                    <div className="dropable-area">
                      <div className="input-drop-area">
                        <Form.Group className="mb-4" controlId='assignTeacher'>
                          <Form.Label>Assign Teacher</Form.Label>
                          <Form.Select
                            disabled={(frmSubmitting || (selectClassSetup)) ? true : false}
                            name="TeacherId"
                            onChange={changeTeacher}
                            onBlur={(e) => setFocusTeacher(true)}
                            value={selectTeacher || ''}
                            isValid={(focusTeacher && selectTeacher === '')}
                            isInvalid={(focusTeacher && !selectTeacher)}>
                            <option value="">{(tLoading) ? 'Loading ...' : 'Select a Teacher'}</option>
                            {
                              teachers.map((teacher, i) => {
                                return (
                                  <option
                                    key={i}
                                    value={teacher.TeacherId}>
                                    {teacher.FullName}
                                  </option>
                                )
                              })
                            }
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {(focusTeacher && !selectTeacher) ? 'Please select Teacher' : ''}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div
                        className="pupil-selected-list"
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                        <div className="dropable-graphic-area">
                          <Image src={ImgDropable} alt="drog drop area" />
                        </div>
                        {dragDropState.selected.map((item, index) => (
                          <Draggable
                            isDragDisabled={frmSubmitting}
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                              <div
                                className="pupil-selected"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}>
                                <div className="pupil-name">
                                  <span className="user-icon">
                                    <Image domain='server' src={item.ProfilePicture} alt={item.FullName} />
                                  </span>
                                  <span className="pupilName">{item.FullName}</span>
                                  <button className="remove" onClick={() => { onDelete(index) }}>
                                    <Image alt="Remove Pupil" src={ImgRemove} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {
                          (psError)
                            ? <>
                              <Form.Control.Feedback type="invalid" className='d-block'>
                                {psError}
                              </Form.Control.Feedback>
                            </>
                            : null
                        }
                        {provided.placeholder}
                      </div>
                      <div className="app-assign-group">
                        <Button
                          onClick={onSubmit}
                          disabled={frmSubmitting}
                          variant='outline-success'>
                          Assign
                          {(frmSubmitting) ? <Spinner className="spinner" animation="border" size="sm" /> : null}
                        </Button>
                        {
                          (selectClassSetup) ?
                            <Button
                              className='ml-1'
                              onClick={(e) => setSelectClassSetup(null)}
                              disabled={frmSubmitting}
                              variant='outline-danger'>
                              Cancel
                            </Button>
                            : null
                        }
                      </div>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </Col>
          <Col lg={3} sm={12}>
            <div className="group-listing">
              <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 'calc(100vh - 165px)' }}>
                <ul>
                  {(csLoading) ? <li className='loadig'>Loading ...  <Spinner animation="grow" size="sm" /></li> : null}
                  {(csError) ? <li className='error'>{csError}</li> : null}
                  {
                    (!csLoading && !csError && (classSetupList && classSetupList.length === 0))
                      ? <li className='not-data'>Not record found</li>
                      : null
                  }
                  {
                    (!csError && (classSetupList && classSetupList.length))
                      ? (
                        classSetupList.map((csitem, i) => {
                          return (selectClassSetup && csitem.TeacherId === selectClassSetup.TeacherId)
                            ? null
                            : <li key={i} className="group">
                              <div className="group">
                                <div className="group-head">
                                  <span>{csitem.teacherFullName}</span>
                                  <Link to="#" onClick={(e) => {
                                    if (!frmSubmitting) {
                                      setSelectClassSetup(csitem)
                                    }
                                  }} title="Edit Group"><HiOutlinePencil /></Link>
                                </div>
                                <div className="group-users">
                                  {
                                    (csitem.pupilList && csitem.pupilList.length)
                                      ? <>
                                        {
                                          csitem.pupilList.slice(0, 7).map((pitem, j) => {
                                            return <div className="user-icon" key={`${i}-${j}`}>
                                              <Image domain='server' src={pitem.ProfilePicture} alt={pitem.fullName} />
                                            </div>
                                          })
                                        }
                                        {
                                          (csitem.pupilList.length > 7)
                                            ? <div className="user-more">+{csitem.pupilList.length - 7}</div>
                                            : null
                                        }
                                      </>
                                      : null
                                  }

                                </div>
                              </div>
                            </li>
                        })
                      )
                      : null
                  }
                </ul>
              </Scrollbars>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ClassSetup;