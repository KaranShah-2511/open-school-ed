import React, { useEffect } from 'react'
import Chart from 'react-apexcharts';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { ParentService } from "../../../../Services/ParentService";
import './Performance.scss';

function Performance() {

  const [lesson, setLesson] = useStateMounted(0);
  const [homework, setHomework] = useStateMounted(0);
  const [pupilID, setPupilID] = useStateMounted<any>();
  const user = useAuth().user();
  const parentService = new ParentService();

  const state = {
    options: {
      labels: ["Engagement", "Effort"],
      colors: ['#bc8bff', '#fabb23'],
      plotOptions: {
        radialBar: {
          size: undefined,
          inverseOrder: false,
          startAngle: 0,
          endAngle: 360,
          offsetX: 0,
          offsetY: 0,
        }
      }
    },
  };

  const getLesson = async () => {
    await parentService.getLesson(pupilID)
      .then((res) => {
        setLesson(res.percentage ? res.percentage : 0);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getHomework = async () => {
    await parentService.getHomework(pupilID)
      .then((res) => {
        setHomework(res.percentage ? res.percentage : 0);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    const pID = (user.activeParentZone) ? user.activeParentZone.Pupilid : 0;
    if (pID !== pupilID) {
      setPupilID(pID);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (pupilID) {
      getLesson();
      getHomework();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pupilID]);

  return (
    <div className='main-performance-container'>

      <div className="first-box-container">
        <div className="left-container">
          <div className="circle-graph">
            <div className="donut">
              <Chart
                options={state.options}
                series={[lesson, homework] ? [lesson, homework] : [0, 0]}
                type="radialBar"
                width="350"
              />
            </div>
          </div>
        </div>
        <div className="right-container">
          <div className="pupil-heading title">
            Pupil are engaged and using the app and submitting home on time
          </div>
          <div className="performance-title ">
            <div className="small-box orchid  ">
            </div>
            <div className="title">
              Pupil engagement over last month
            </div>
          </div>
          <div className="performance-title">
            <div className="small-box yellow ">
            </div>
            <div className="title">
              Pupil effort over last month
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Performance