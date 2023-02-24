import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import Image from '../../../Components/Image';
import './Pupil.scss';

function Pupil() {

  const [showIndicator, setIndicator] = useState<boolean>(true);

  const slideChange = (index) => {
    if (index === 2) {
      setIndicator(false);
    } else {
      setIndicator(true);
    }
  };

  return (
    <div className="app-intro-pupil">
      <Carousel showThumbs={false} onChange={slideChange} showArrows={false} showIndicators={showIndicator} emulateTouch showStatus={false}>
        <div className="slide one">
          <Image src="/assets/images/introslide/pupil-1.svg" loading="eager" alt="Pupil" />
          <div className="caption">
            <h2>Always there for pupils</h2>
            <p>Identify and support any pupil that may need extra attention with insights into their attendance, participation and achievements.</p>
          </div>
        </div>
        <div className="slide two">
          <Image src="/assets/images/introslide/pupil-2.svg" loading="eager" alt="Pupil" />
          <div className="caption">
            <h2>Secure, encrypted and safe</h2>
            <p>Designed with data privacy and protection at its heart, MyEd Open School is safe, secure and only accessible by your school and pupils.</p>
          </div>
        </div>
        <div className="slide three">
          <Image src="/assets/images/introslide/pupil-3.svg" loading="eager" alt="Pupil" />
          <div className="caption">
            <h2>Fast and easy setup</h2>
            <p>Easily transfer data using CSV uploads to quickly set up your school, teacher, and pupil accounts in just a few clicks.</p>
            <Link className="btn btn-success" to="/login/pupil">Get Started</Link>
          </div>
        </div>
      </Carousel>
    </div>
  );
}

export default Pupil;
