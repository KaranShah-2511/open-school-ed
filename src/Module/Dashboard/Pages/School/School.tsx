import React from 'react';
import Insights from '../../Components/Insights';
import MyTeachers from '../../Components/MyTeachers';
import './School.scss';

function School() {

  return (
    <div className="app-school-dashboard">
      <Insights utype="school" />
      <MyTeachers utype="school" />
    </div>
  );
}

export default School;
