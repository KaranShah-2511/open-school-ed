import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { Image } from '../../../../Components';
import { useAuth } from '../../../../Core/Providers';
import Scrollbars from "react-custom-scrollbars";
import { useStateMounted } from '../../../../Core/Hooks';
import './Pupil.scss'
import { Button, Container, Toast, ToastContainer } from 'react-bootstrap';
import { QuickBlox } from '../../../../Services/QuickBloxService';
import { Storage } from '../../../../Core/Services/StorageService';
import { BsPlusCircleFill } from 'react-icons/bs';

function Pupil() {

  const [showSwitch, setShowSwitch] = useStateMounted(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user();

  const handelAction = (action: 'logout' | 'cancel') => {
    if (action === 'logout') {
      auth.logout()
        .then(() => {
          QuickBlox.destroySession(() => {
            Storage.delete('QB_APP_SESSION');
          });
          navigate('/login/' + user.userType.Type, { replace: true });
        });
    }
    setShowSwitch(false);
  };

  const selectPupil = (pupil) => {
    if (pupil.id === user.id) {
      user.setActivePupil(pupil);
      auth.setUser(user)
        .then(() => {
          navigate('/');
        }).catch(() => { });
    } else {
      setShowSwitch(true);
    }
  };

  const onAddNew = () => {
    auth.logout()
      .then(() => {
        QuickBlox.destroySession(() => {
          Storage.delete('QB_APP_SESSION');
        });
        setTimeout(() => {
          navigate('/pupil-registration', { replace: true });
        }, 150);
      });
  }

  return (
    <>
      <Helmet>
        <title>Who will be learning today?</title>
      </Helmet>
      <div className="app-pupil-list">
        <ToastContainer className="p-3 position-fixed" position="top-center">
          <Toast onClose={() => setShowSwitch(false)} bg="light" show={showSwitch}>
            <Toast.Body>
              <p style={{ fontSize: '1.1rem' }}>Please logout current pupil to switch.</p>
              <div className='toast-btn-area'>
                <Button onClick={() => handelAction('logout')} type="button" variant='success'>Logout</Button>
                <Button onClick={() => handelAction('cancel')} type="button" variant='danger'>Cancel</Button>
              </div>
            </Toast.Body>
          </Toast>
        </ToastContainer>
        <div className="pupil-banner"></div>
        <Container className="pupil-listing">
          <div className="pupils">
            <h2 className="title">Who will be learning today?</h2>
            <Scrollbars className="scrollbars" style={{ width: '100%', height: '240px' }}>
              <div className='children-list'>
                <ul>
                  {
                    user.childrenList.map((children, i) => {
                      return (
                        <li key={i}>
                          <Link to="#" title={children.FullName} onClick={() => selectPupil(children)}>
                            <Image domain="server" src={children.ProfilePicture} alt={children.FullName} />
                            <span className="pupil-name">{children.FullName}</span>
                          </Link>
                        </li>
                      )
                    })
                  }
                  <li>
                    <Link to="#" title="Add new user" onClick={() => onAddNew()}>
                      <BsPlusCircleFill />
                      <span className="pupil-name">Add new user</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </Scrollbars>
            <div className='bottom-area'>
              <Link to={"/parents/zone"} className='parent-zone-link'>
                <Image src='/assets/images/svg/Parent-Zone.svg' alt='' />
                Parent Zone
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

export default Pupil
