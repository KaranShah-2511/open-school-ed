import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Confirmation.scss';

function Confirmation() {

  const onClickEmail = (e, email) => {
    window.location = email;
    e.preventDefault();
  }
  return (
    <div className="app-pupil-registration-confirmation">
      <Row>
        <Col lg={4} md={6} sm={12}>
          <div className="banner"></div>
        </Col>
        <Col lg={8} md={6} sm={12}>
          <div className="content-area">
            <div>
              <h2 className="title">Confirm your email address</h2>
              <p>An email has been sent to the following email address:</p>
              <p >
                <Link className="mail-link" to='#' onClick={(e) => onClickEmail(e, 'mailto:email@emailaddress.com')}>
                  email@emailaddress.com
                </Link>
              </p>
              <p className="verify-text">Please check your email and click verify to get started <br />with MyEd Open School.</p>
              <Button variant="success" type="submit">Resend Verification email</Button>
              <p className="mt-5 intro">Once you confirm your email address you will <br />automatically go to the next step.</p>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Confirmation;
