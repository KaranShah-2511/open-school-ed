import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import Routes from '../../Core/Components/Routes';
import { Auth } from '../../Core/Services/AuthService';
import routes from './Config/Routes';


function Parents(props) {

  const user = Auth.getUser();
  let location = useLocation();

  return (
    <>
      <Helmet>
        <title>Parent Zone</title>
      </Helmet>
      <div className="app-parents">
        {
          (user.activeParentZone)
            ?
            <Routes
              location={location}
              routes={[...routes['zone'], ...routes['comman']]}
              notFound="/404"
              defaultProps={{ uType: user.userType.Type }}
            />
            : <Routes
              location={location}
              routes={[...routes['comman']]}
              notFound="/404"
              defaultProps={{ uType: user.userType.Type }}
            />
        }
      </div>
    </>
  );
}

export default Parents;
