import React from 'react';
import PropTypes from 'prop-types';
import video from '../../Assets/Media/myed-open-school.mp4';
import videoWebm from '../../Assets/Media/myed-open-school.webm';
import './Loader.scss';

type LoaderProps = {
  loop?: boolean;
  controls?: boolean;
  play?: boolean;
  video?: string;
  videoWebm?: string;
};

const propTypes = {
  loop: PropTypes.bool,
  controls: PropTypes.bool,
  play: PropTypes.bool,
  video: PropTypes.string,
  videoWebm: PropTypes.string
};

function Loader(props: LoaderProps) {
  return (
    <div className="app-loader">
      <video className="loder-video"
        loop={props.loop || false}
        controls={props.controls || false}
        autoPlay={props.play || false}
        playsInline>
        <source src={props.videoWebm || videoWebm} type="video/webm" />
        <source src={props.video || video} type="video/mp4" />
      </video>
    </div>
  );
}

Loader.propTypes = propTypes;

export default Loader;