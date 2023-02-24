import React from 'react';
import { Navigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import School from './School';
import Teacher from './Teacher';
import Pupil from './Pupil';
import './Introduction.scss';

function Introduction() {
  const userType = (process.env.REACT_APP_MEMBER_TYPE || '').split('|');
  const { utype } = useParams();

  return (
    <>
      <Helmet>
        <title>Introduction</title>
      </Helmet>
      {
        (userType.includes(utype || ''))
          ? (
            <div className="app-introduction">
              {
                (utype === 'school')
                  ? <School />
                  : (utype === 'teacher') ? <Teacher /> : <Pupil />
              }
            </div>
          )
          : <Navigate replace={true} to="/user-type" />
      }
    </>
  );
}

export default Introduction;
