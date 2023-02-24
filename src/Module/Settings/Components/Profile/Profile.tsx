import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import './Profile.scss';

type ProfileProps = {
  utype: string;
}

function Profile(props: ProfileProps) {

  const { utype } = props;
  const userId = useParams().id;

  
  return (
    <>
      <div>
      <h1>UserId is {userId}</h1>
      </div>
    </>
  );
}

Profile.propTypes = {
  utype: PropTypes.string.isRequired
};

export default Profile;
