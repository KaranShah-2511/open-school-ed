import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import Routes from '../../Core/Components/Routes';
import { useLayout } from '../../Core/Providers/LayoutProvider';
import { Auth } from '../../Core/Services/AuthService';
import routes from './Config/Routes';

function GlobalMessage() {

  const user = Auth.getUser();
  const typeRoute = routes[user.userType.Type] || [];
  let location = useLocation();
  const layout = useLayout();

  const heading = (
    <>
      <h2 className="header-title">Global Messaging</h2>
    </>
  );

  useEffect(() => {
    layout.clear().set({
      heading: heading
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Global Messaging</title>
      </Helmet>
      <div className="app-global-message">
        <Routes
          location={location}
          routes={[...typeRoute, ...routes['comman']]}
          notFound="/404"
          defaultProps={{ uType: user.userType.Type }}
        />
      </div>
    </>
  );
}

export default GlobalMessage;
