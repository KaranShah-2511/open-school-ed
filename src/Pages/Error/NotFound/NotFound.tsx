import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLayout } from '../../../Core/Providers';
import './NotFound.scss';

function NotFound(props: any) {

  const location = useLocation();
  const layout = useLayout();

  const heading = (
    <>
      <h2 className="header-title">Not Found</h2>
    </>
  );

  useEffect(() => {
    layout.clear().set({
      heading: heading,
      headerClass: 'app-inner',
      mainContentClass: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="NotFound">
      Page not found '{(location.state as { from: any })?.from?.pathname}'
    </div>
  );
}

export default NotFound;
