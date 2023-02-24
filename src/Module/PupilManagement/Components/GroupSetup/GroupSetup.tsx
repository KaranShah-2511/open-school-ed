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
import { GroupSetupList, GroupSetupParam, Pupil, PupilService } from '../../../../Services/PupilService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './GroupSetup.scss';

function GroupSetup() {

  const [dragDropState, setDragDropState] = useStateMounted<{ items: Pupil[], selected: Pupil[] }>({ items: [], selected: [] });
  const dragDropIdList = {
    droppable: 'items',
    droppable2: 'selected'
  };
  const [showError, setShowError] = useStateMounted<string | null>(null);
  const [showSuccess, setShowSuccess] = useStateMounted<string | null>(null);
  const [frmSubmitting, setFrmSubmitting] = useStateMounted<boolean>(false);
  const [gsLoading, setGsLoading] = useStateMounted<boolean>(true);
  const [psError, setPsError] = useStateMounted<string | null>(null);
  const [gsError, setGsError] = useStateMounted<string | null>(null);
  const [selectGroupSetup, setSelectGroupSetup] = useStateMounted<GroupSetupList | null>();
  const [groupSetupList, setGroupSetupList] = useStateMounted<GroupSetupList[]>([]);
  const [pgsLoading, setPgsLoading] = useStateMounted<boolean>(true);
  const [pgsError, setPgsError] = useStateMounted<string | null>(null);
  const [pupilGroupSetupList, setPupilGroupSetupList] = useStateMounted<Pupil[]>([]);
  const [selectGroup, setSelectGroup] = useStateMounted<string>('');
  const [focusGroup, setFocusGroup] = useStateMounted<boolean>(false);
  const pupilService = new PupilService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getGroupSetupList();
      getPupilGroupSetupList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pupilGroupSetupList.length) {
      setDragDropState((pstate) => {
        return { ...pstate, items: pupilGroupSetupList }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pupilGroupSetupList]);

  useEffect(() => {
    if (selectGroupSetup) {
      setPsError(null);
      setSelectGroup(selectGroupSetup.GroupName);
      if (selectGroupSetup.pupilList && selectGroupSetup.pupilList.length) {
        const selected: any = [];
        const items = pupilGroupSetupList.filter((item) => {
          const match = selectGroupSetup.pupilList.filter((gsp) => item.id === gsp.PupilId);
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
      setSelectGroup('');
      setDragDropState({ items: pupilGroupSetupList, selected: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectGroupSetup]);

  const getGroupSetupList = async () => {
    setGsLoading(true);
    setGsError(null);
    await pupilService.groupSetupListByTeacherID(user.id)
      .then((res) => {
        setGroupSetupList(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setGsError(e.message);
        } else {
          setGsError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setGsLoading(false);
      });
  };

  const getPupilGroupSetupList = async () => {
    setPgsLoading(true);
    setPgsError(null);
    await pupilService.pupilGroupSetupByTeacherID(user.id)
      .then((res) => {
        setPupilGroupSetupList(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setPgsError(e.message);
        } else {
          setPgsError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setPgsLoading(false);
      });
  };

  const onSubmit = async () => {
    setPsError(null);
    setFrmSubmitting(true);
    setFocusGroup(true);
    if (!dragDropState.selected.length) {
      setPsError('Assign at least 1 pupil');
      setFrmSubmitting(false);
      return;
    }
    if (!selectGroup) {
      setFrmSubmitting(false);
      return;
    }

    const addPupilList: any = dragDropState.selected.map((p) => { return { PupilId: p.PupilId }; });

    let callback;

    const params: GroupSetupParam = {
      GroupName: selectGroup,
      TeacherId: user.id,
      CreatedBy: user.id,
      PupilList: addPupilList,
    };
    if (selectGroupSetup) {
      callback = pupilService.groupSetupUpdate(selectGroupSetup.id, params);
    } else {
      callback = pupilService.groupSetupSave(params);
    }
    await callback
      .then(async (res) => {
        setShowSuccess('Group Setup successfully.');
        setSelectGroupSetup(null);
        setFocusGroup(false);
        setSelectGroup('');
        getGroupSetupList();
        setDragDropState({ items: pupilGroupSetupList, selected: [] });
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
      <div className='pupil-group-setup'>
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
                          {(pgsLoading) ? <div className='loading'>Loading ...  <Spinner animation="grow" size="sm" /></div> : null}
                          {(pgsError) ? <div className='error'>{pgsError}</div> : null}
                          {
                            (!pgsLoading && !pgsError && (dragDropState.items && dragDropState.items.length === 0))
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
                        <Form.Group className="mb-4" controlId='group'>
                          <Form.Control
                            disabled={(frmSubmitting || (selectGroupSetup)) ? true : false}
                            name="group"
                            type="text"
                            onChange={(e) => setSelectGroup(e.target.value)}
                            onBlur={(e) => setFocusGroup(true)}
                            value={selectGroup || ''}
                            isValid={(focusGroup && selectGroup === '')}
                            isInvalid={(focusGroup && !selectGroup)}
                            placeholder="Enter group name" />
                          <Form.Control.Feedback type="invalid">
                            {(focusGroup && !selectGroup) ? 'Please enter group name' : ''}
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
                          (selectGroupSetup) ?
                            <Button
                              className='ml-1'
                              onClick={(e) => setSelectGroupSetup(null)}
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
                  {(gsLoading) ? <li className='loadig'>Loading ...  <Spinner animation="grow" size="sm" /></li> : null}
                  {(gsError) ? <li className='error'>{gsError}</li> : null}
                  {
                    (!gsLoading && !gsError && (groupSetupList && groupSetupList.length === 0))
                      ? <li className='not-data'>Not record found</li>
                      : null
                  }
                  {
                    (!gsError && (groupSetupList && groupSetupList.length))
                      ? (
                        groupSetupList.map((gsitem, i) => {
                          return (selectGroupSetup && gsitem.id === selectGroupSetup.id)
                            ? null
                            : <li key={i} className="group">
                              <div className="group">
                                <div className="group-head">
                                  <span>{gsitem.GroupName}</span>
                                  <Link to="#" onClick={(e) => {
                                    if (!frmSubmitting) {
                                      setSelectGroupSetup(gsitem)
                                    }
                                  }} title="Edit Group"><HiOutlinePencil /></Link>
                                </div>
                                <div className="group-users">
                                  {
                                    (gsitem.pupilList && gsitem.pupilList.length)
                                      ? <>
                                        {
                                          gsitem.pupilList.slice(0, 7).map((pitem, j) => {
                                            return <div className="user-icon" key={`${i}-${j}`}>
                                              <Image domain='server' src={pitem.ProfilePicture} alt={pitem.PupilName} />
                                            </div>
                                          })
                                        }
                                        {
                                          (gsitem.pupilList.length > 7)
                                            ? <div className="user-more">+{gsitem.pupilList.length - 7}</div>
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

export default GroupSetup;