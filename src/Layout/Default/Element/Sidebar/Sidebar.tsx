import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import { useLocation, useNavigate } from 'react-router';
import { Dropdown, SplitButton } from 'react-bootstrap';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import Image from '../../../../Components/Image';
import '@trendmicro/react-sidenav/dist/react-sidenav.min.css';
import { QuickBlox } from '../../../../Services/QuickBloxService';
import { Storage } from '../../../../Core/Services/StorageService';
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import { useStateMounted } from '../../../../Core/Hooks';
import './Sidebar.scss';


type SideBarProps = {
  onToggle: Function;
};

function Sidebar(props: SideBarProps) {

  const location = useLocation();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user();
  const userType = user.userType.Type;
  const appTitle = process.env.REACT_APP_TITLE || 'MyEd Open School';
  const [showSwitch, setShowSwitch] = useStateMounted(false);

  const menus: any[] = [
    {
      path: '/dashboard',
      icon: '/assets/images/svg/dashboard.svg',
      text: 'Dashboard'
    },
    // School Menu
    {
      path: '/teacher-management',
      icon: '/assets/images/svg/lesson-planner.svg',
      text: 'Teacher Management',
      utype: ['school']
    },
    {
      path: '/pupil-management',
      icon: '/assets/images/svg/pupil-management.svg',
      text: 'Pupil Management',
      utype: ['school']
    },
    {
      path: '/global-message',
      icon: '/assets/images/svg/parents.svg',
      text: 'Global Message',
      utype: ['school']
    },
    // Teacher Menu
    {
      path: '/timetable',
      icon: '/assets/images/svg/my-calendar.svg',
      text: 'My Calendar',
      utype: ['teacher', 'pupil']
    },
    {
      path: '/lesson',
      icon: '/assets/images/svg/lesson-planner.svg',
      text: 'Lesson Planner',
      utype: ['teacher', 'pupil']
    },
    {
      path: '/pupil-management',
      icon: '/assets/images/svg/pupil-management.svg',
      text: 'Pupil Management',
      utype: ['teacher']
    },
    {
      path: '/global-message',
      icon: '/assets/images/svg/parents.svg',
      text: 'Global Message',
      utype: ['teacher']
    },
    //pupil
    {
      path: '/avatar',
      icon: '/assets/images/svg/avatar-menu.svg',
      text: 'Avatar',
      utype: ['pupil']
    },
    // Comman
    {
      path: '/faq',
      icon: '/assets/images/svg/faq.svg',
      text: 'FAQ'
    },
    {
      path: 'logout',
      icon: '/assets/images/svg/logout.svg',
      text: 'Logout'
    }
  ];

  useEffect(() => {
    (async () => {
      props.onToggle(expanded);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const paths = location.pathname.split('/');
      const setPath = (paths.length >= 2) ? '/' + paths[1] : location.pathname;
      setSelected(setPath);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const onSelect = (selected: any) => {
    if (selected !== 'logout') {
      navigate(selected);
    } else {
      setShowSwitch(true)
    }
    setSelected(selected);
    onToggle(false)
  }

  const onToggle = (event: any) => {
    setExpanded(event);
    props.onToggle(event);
  };

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
  return (
    <>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast onClose={() => setShowSwitch(false)} bg="light" show={showSwitch}>
          <Toast.Body>
            <p style={{ fontSize: '1.1rem' }}>Are you sure?</p>
            <div className='toast-btn-area'>
              <Button onClick={() => handelAction('logout')} type="button" variant='success'>Logout</Button>
              <Button onClick={() => handelAction('cancel')} type="button" variant='danger'>Cancel</Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <SideNav componentClass="div" onSelect={onSelect} onToggle={onToggle} expanded={expanded}
        className={'app-sidenav' + ((expanded) ? ' expanded' : ' collapsed')}>
        <SideNav.Toggle className="sidenav-toggle">
          <Image src="/assets/images/play_store_512.png" alt={appTitle} title={appTitle} />
          <span className="app-name">MyEd Open School</span>
        </SideNav.Toggle>
        <SideNav.Nav className={'sidenav-items' + ((expanded) ? ' expanded' : ' collapsed')} selected={selected}>
          {menus.map((item, i) => {
            return (
              (!item.utype || (item.utype && item.utype.includes(userType)))
                ? <NavItem className="sidenav-item" key={i} eventKey={item.path}>
                  <NavIcon><Image src={item.icon} alt={item.text} title={item.text} /></NavIcon>
                  <NavText>{item.text}</NavText>
                </NavItem>
                : null
            );
          })}
        </SideNav.Nav>
        <div className="sidenav-footer-profile">
          {(user.id)
            ? <>
              <div className="profile-detail">
                <Image domain="server" src={user.ProfilePicture} alt={user.FullName} title={user.FullName} />
                <span className="user-name">{user.FullName}</span>
              </div>
              <SplitButton onSelect={onSelect} title={user.FullName} key={'up'} drop={'up'}>
                {/* <Dropdown.Item eventKey="settings/profile">Edit</Dropdown.Item> */}
                <Dropdown.Item eventKey="settings">Settings</Dropdown.Item>
                <Dropdown.Item eventKey="logout">Logout</Dropdown.Item>
              </SplitButton>
            </>
            : null}
        </div>
      </SideNav>
    </>
  );
}

Sidebar.propTypes = {
  onToggle: PropTypes.func
};

export default Sidebar;
