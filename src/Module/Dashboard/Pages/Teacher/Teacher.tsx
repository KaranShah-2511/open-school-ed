import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Image from '../../../../Components/Image';
import MyClasses from '../../Components/MyClasses';
import MyPupils from '../../Components/MyPupils';
import './Teacher.scss';

function Teacher() {

  return (
    <div className="app-teacher-dashboard">
      <div className="boxes-main">
        <Row>
          <Col className="d-flex" lg={3} xs={3}>
            <Link to="#" className="box box-call" title="Start a new call">
              <span>Start a new <br />call</span>
              <Image src="/assets/images/svg/call.svg" alt="Start a new call" className="box-icon" />
            </Link>
          </Col>
          <Col className="d-flex" lg={3} xs={3}>
            <Link to="/lesson/add" className="box box-lesson" title="New lesson">
              <span>New lesson</span>
              <Image src="/assets/images/svg/lesson.svg" alt="New lesson" className="box-icon" />
            </Link>
          </Col>
          <Col className="d-flex" lg={3} xs={3}>
            <Link to={'/timetable/calendar-entry'} className="box box-calender" title="New calendar entry">
              <span>New calendar <br />entry</span>
              <Image src="/assets/images/svg/calender.svg" alt="New calendar entry" className="box-icon" />
            </Link>
          </Col>
          <Col className="d-flex" lg={3} xs={3}>
            <Link to="/pupil-management/group-set-up" className="box box-pupil" title="Add new pupil group">
              <span>Add new pupil <br />group</span>
              <Image src="/assets/images/svg/pupil-group.svg" alt="Add new pupil group" className="box-icon" />
            </Link>
          </Col>
        </Row>
      </div>
      <MyClasses utype="teacher" />
      <MyPupils utype="teacher" />
    </div>
  );
}

export default Teacher;
