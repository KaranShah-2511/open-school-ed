import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import { useLocation } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { IoMdArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useLayout } from '../../../../../Core/Providers/LayoutProvider';
import { Whiteboard } from "react-fabricjs-whiteboard";
import './OpenWorkspace.scss';

type HeadingProps = {
  returnTo?: any;
}

function Heading(props: HeadingProps) {

  const {  returnTo } = props;

  return <>
    <Helmet>
      <title>
        Open Workspace
      </title>
    </Helmet>
    <h2 className="header-title">
      {(returnTo) ? <Link to={returnTo}><IoMdArrowBack /></Link> : null}
      Open Workspace
    </h2>
  </>
};

Heading.propTypes = {

  returnTo: PropTypes.string
};


function OpenWorkspace() {
 
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  const layout = useLayout();

  useEffect(() => {
    const heading = <>
      <Heading
        returnTo={returnTo}
      />
    </>;


    layout.clear().set({
      heading: heading,
      headerClass: 'header-pupil-homework-detail app-inner',
      mainContentClass: 'main-pupil-homework-detail',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, returnTo]);



  return (
    <div>
      <Whiteboard aspectRatio={4 / 2}/>
    </div>
  )
}

export default OpenWorkspace
