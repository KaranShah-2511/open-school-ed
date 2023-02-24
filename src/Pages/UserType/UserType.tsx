import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Image from '../../Components/Image';
import './UserType.scss';

function UserType() {

  return (
    <>
      <Helmet>
        <title>User Type</title>
      </Helmet>
      <div className="app-user-type">
        <div className="user-banner"></div>
        <div className="user-listing">
          <div className="users">
            <h2 className="title">Select the type of user you are</h2>
            <ul>
              <li>
                <Link to="/introduction/school" title="School">
                  <Image src="/assets/images/svg/school.svg" alt="School" />
                  <span className="user-type">School</span>
                </Link>
              </li>
              <li>
                <Link to="/introduction/teacher" title="Teacher">
                  <Image src="/assets/images/svg/teacher.svg" alt="Teacher" />
                  <span className="user-type">Teacher</span>
                </Link>
              </li>
              <li>
                <Link to="/introduction/pupil" title="Pupil">
                  <Image src="/assets/images/svg/pupil.svg" alt="Pupil" />
                  <span className="user-type">Pupil</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserType;
