import React from 'react';
import PropTypes from 'prop-types';
import Scrollbars from 'react-custom-scrollbars';
import { Image } from '../../../../Components';
import { Link } from 'react-router-dom';
import ImgNoInsights from '../../../../Assets/Images/Svg/no-insights.svg';
import './Insights.scss';

type InsightsProps = {
  utype: string;
}

function Insights(props: InsightsProps) {

  const { utype } = props;

  return (
    (utype)
      ? <>
        <div className={'app-my-insights ' + utype + '-insights'}>
          <div className="panel">
            <div className="panel-header">
              <div className="header-inner">
                <Image src="/assets/images/svg/chart-bar.svg" alt="Insights" className="icon" />
                <h2>Insights</h2>
              </div>
              <div className="header-inner">
                <Link to="#" className="more-action" title="More Insights">
                  <Image src="/assets/images/svg/more-v-white.svg" alt="More Insights" />
                </Link>
              </div>
            </div>
            <div className="panel-body">
              <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
                <div className="app-empty-screen">
                  <div className="app-empty-icon">
                    <Image src={ImgNoInsights} alt="Insights Empty" />
                  </div>
                  <div className="app-empty-content">
                    <h3>No insights yet</h3>
                    <p>Start using the app to gather more insights</p>
                  </div>
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </>
      : null
  );
}

Insights.propTypes = {
  utype: PropTypes.string.isRequired
};

export default Insights;
