import React from 'react';
import MyClasses from '../../Components/MyClasses';
import MyHomework from '../../Components/MyHomework';
import MyAvatar from '../../Components/MyAvatar';
import './Pupil.scss';

function Pupil() {

  return (
    <div className="app-pupil-dashboard">
      <MyClasses utype="pupil" />
      <MyHomework utype="pupil" />
      <MyAvatar  />
    </div>
  );
}

export default Pupil;


