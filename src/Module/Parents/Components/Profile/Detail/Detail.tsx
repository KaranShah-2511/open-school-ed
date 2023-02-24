import React, { useEffect } from 'react'
import { Col, Row, Container, Form } from 'react-bootstrap';
import { useAuth } from '../../../../../Core/Providers/AuthProvider';
import { useStateMounted } from '../../../../../Core/Hooks';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Image } from '../../../../../Components';
import { Children } from '../../../../../Services/UserService';
import './Detail.scss';


function Detail() {

  const [myPupil, setPupil] = useStateMounted<Children>();
  const user = useAuth().user();

  useEffect(() => {
    if (user.activeParentZone) {
      if (myPupil && user.activeParentZone.id !== myPupil.id) {
        setPupil(user.activeParentZone);
      }
      if (!myPupil) {
        setPupil(user.activeParentZone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {
        (myPupil)
          ? <><div className='pupil-profile-view'>
            <div className="profile-banner">
              <div className="profile-pic">
                {(myPupil.ProfilePicture) ? <Image domain="server" src={myPupil.ProfilePicture} alt={myPupil.FullName} /> : null}
              </div>
              <div className="edit-profile">
                <Link
                  to={'../edit-pupil'}
                  className="btn btn-success" type="button">Edit Pupil</Link>
              </div>
            </div>
            <Container className='student-details'>
              <div className="profile-detail mt-3">
                <label className='title-line'>Student details</label>
                <Row className='personal-info'>
                  <Col className="mb-3" lg={4} md={6}>
                    <label>First Name</label>
                    <p>{myPupil.FirstName} {myPupil.LastName}</p>
                  </Col>
                  <Col className="mb-3" lg={4} md={6}>
                    <label>Date of birth</label>
                    <p>{moment(myPupil.Dob).format('DD/MM/YYYY')}</p>
                  </Col>
                  <Col className="mb-3" lg={4} md={6}>
                    <label>Unique Id</label>
                    <p>{myPupil.UniqueNumber}</p>
                  </Col>
                </Row>
                {
                  (myPupil.Note) ? <Row className='personal-info'>
                    <Col className="mb-3">
                      <label>Note</label>
                      <p>{myPupil.Note}</p>
                    </Col>
                  </Row> : null
                }

              </div>
              <div className='parent-detail mt-50'>
                <label className='title-line'>Parent / Guardian</label>
                <Row className='personal-info'>
                  <Col className="mb-3" lg={4} md={6}>
                    <Form.Label>Relationship to pupil</Form.Label>
                    <p>{myPupil.Relationship}</p>
                  </Col>
                  <Col className="mb-3" lg={4} md={6}>
                    <Form.Label>Parent Guardian name</Form.Label>
                    <p>{(myPupil.ParentFirstName)} {(myPupil.ParentLastName)}</p>
                  </Col>
                  <Col className="mb-3" lg={4} md={6}>
                    <Form.Label>Contact tel.</Form.Label>
                    <p>{myPupil.MobileNumber}</p>
                  </Col>
                </Row>
                <Row className='personal-info'>
                  <Col className="mb-3" md={6}>
                    <Form.Label>Associated email for child's acc.</Form.Label>
                    <p>{myPupil.Email}</p>
                  </Col>
                  <Col className="mb-3" md={6}>
                    <Form.Label>Password</Form.Label>
                    <p>********</p>
                  </Col>
                </Row>
                <Row className='personal-info'>
                  <Col className='address'>
                    <Form.Label>Address</Form.Label>
                    <p >{myPupil.AddressLine1} {myPupil.AddressLine2}</p>
                  </Col>
                </Row>
              </div>
            </Container>
          </div>
          </>
          : null
      }
    </>
  )
}

export default Detail
