import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, AuthConsumer, useAuth } from './Core/Providers/AuthProvider';
import { ProviderComposer, provider } from './Core/Providers/ProviderComposer';
import { useLocation } from "react-router-dom";
import Routes from './Core/Components/Routes';
import routes from './Config/Routes';
import Default from './Layout/Default';
import Loader from './Components/Loader';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useNetwork } from './Core/Hooks';
import { CloseButton, Toast, ToastContainer } from 'react-bootstrap';
import { LayoutProvider } from './Core/Providers/LayoutProvider';
import { v4 as uuidv4 } from 'uuid';
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { QuickBlox } from './Services/QuickBloxService';
import { Auth } from './Core/Services/AuthService';

const pubnubConfig = new PubNub({
  publishKey: process.env.REACT_APP_PUB_NUB_PUBLISH_KEY,
  subscribeKey: process.env.REACT_APP_PUB_NUB_SUBSCRIBE_KEY,
  uuid: uuidv4()
});

function Access() {

  const location = useLocation();
  const auth = useAuth();
  const typeRoutes = (auth.isAuth())? (routes[auth.user().userType.Type] || []) : [];
  
  if (auth.isAuth() && (auth.user().userType.Type === 'pupil' && !auth.user().activePupil)) {
    return <Routes
      location={location}
      redirect="/login"
      routes={[...routes['parents'], ...routes['comman'], ...typeRoutes]}
      isAuthorized={auth.isAuth()}
      notFound="/404"
    />;
  }

  return <Routes
    location={location}
    redirect="/login"
    routes={[...routes['app'], ...routes['comman'], ...typeRoutes]}
    isAuthorized={auth.isAuth()}
    layout={(auth.isAuth()) ? <Default location={location} /> : ''}
    notFound="/404"
  />;
}

function Init() {

  const appTitle = process.env.REACT_APP_TITLE || 'MyEd Open School';

  return (
    <ProviderComposer
      providers={
        [
          provider(HelmetProvider),
          provider(AuthProvider),
          provider(LayoutProvider)
        ]
      }>
      <Helmet
        titleTemplate={'%s - ' + appTitle}
        defaultTitle={appTitle} />
      <AuthConsumer>
        {
          () => (
            <>
              <PubNubProvider client={pubnubConfig}>
                <Access />
              </PubNubProvider>
            </>
          )
        }
      </AuthConsumer>
    </ProviderComposer>
  );
}

function Network() {

  const [online, setOnline] = useState(false);
  const [offline, setOffline] = useState(false);
  const network = useNetwork();
  const onlyOnce = useRef(true);

  useEffect(() => {
    if (onlyOnce.current === false) {
      setOnline(false);
      if (network) {
        setOnline(true);
      } else {
        setOffline(true);
      }
    }
    onlyOnce.current = false;
  }, [network]);

  return (
    <>
      <ToastContainer className={"app-network " + ((network) ? "online" : "offline")} position="top-center">
        {
          (!network)
            ? <Toast className="m-3" onClose={() => setOffline(false)} bg="danger" show={offline}>
              <Toast.Body>No internet connection <CloseButton variant="white" onClick={() => setOffline(false)} /></Toast.Body>
            </Toast>
            : null
        }
        <Toast className="m-3" onClose={() => setOnline(false)} bg="success" show={online} delay={3000} autohide>
          <Toast.Body>Online <CloseButton variant="white" onClick={() => setOnline(false)} /></Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

function App() {

  const [loader, setLoader] = useState(false);

  const qbSetup = (e, r) => {
    if (!e && Auth.isAuthorized()) {
      const user = Auth.getUser();
      if (user.QBUserId) {
        const qbLoginParam = {
          login: user.Email,
          password: user.getPassword()
        };
        QuickBlox.login(qbLoginParam, () => { });
      }
    }
  };

  useEffect(() => {
    // Quick Blox
    QuickBlox.setup(qbSetup);

    setTimeout(() => {
      setLoader(false);
    }, 6000);
  }, []);

  return (
    <>
      <Network />
      {
        ((loader) ?
          <>
            <Loader play={true} />
          </>
          :
          <>
            <Init />
          </>)
      }
    </>
  );
}

export default App;
