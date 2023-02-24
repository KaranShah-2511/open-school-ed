import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Nav, Tab } from 'react-bootstrap';
import Notification from '../../../../Layout/Default/Components/Notification';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useStateMounted, useVisibility } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import { Image } from '../../../../Components';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { QuickBlox } from '../../../../Services/QuickBloxService';
import { Storage } from '../../../../Core/Services/StorageService';
import { NewsFeed, Performance, Detail, MySchool } from '../../Components';
import { IoMdArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import './Zone.scss'



type HeaderProps = {
  defaultActiveTab: string;
  onSelectTab: ((key: any) => void);
  returnTo?: any;
}

function Header(props: HeaderProps) {
  const { returnTo } = props;

  const { defaultActiveTab, onSelectTab } = props;
  const [activeTab, setActiveTab] = useStateMounted();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user();

  const onSelect = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

  const getPupil = (key) => {
    return user.childrenList[key];
  };

  const onChildren = (key) => {
    const pupil = getPupil(key);
    user.setActiveParentZone(pupil);
    auth.setUser(user)
      .then(() => {
        navigate('/parents/zone', { replace: true });
      })
      .catch(() => { });
  };

  const onLogout = () => {
    auth.logout()
      .then(() => {
        QuickBlox.destroySession(() => {
          Storage.delete('QB_APP_SESSION');
        });
        navigate('/login/' + user.userType.Type, { replace: true });
      });
  }

  useEffect(() => {
    onSelect(defaultActiveTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveTab]);

  useEffect(() => {
    if (activeTab && onSelectTab !== undefined) {
      onSelectTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  return <>
    <div className={'app-patent-zone-header-outer sticky-md-top app-inner'}>
      <div className="app-header">
        <h2 className="header-title">
          {(returnTo) ? <Link to={returnTo}> <IoMdArrowBack /></Link> : null}
          Parent Zone
        </h2>
        <div className="app-header-right">
          <div>
            <Button variant='success' className='save-btn'
              onClick={onLogout}>
              <RiLogoutBoxRLine /> Logout
            </Button>
          </div>
          <div className='children-list'>
            <Dropdown className="filter-dropdown" onSelect={onChildren}>
              <Dropdown.Toggle variant="outline-secondary">
                {
                  (user.activeParentZone)
                    ? <>
                      <Image domain="server" src={user.activeParentZone.ProfilePicture} alt={user.activeParentZone.FullName} />
                      <span>{user.activeParentZone.FullName}</span>
                    </>
                    : null
                }
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  user.childrenList.map((child, i) => {
                    return <Dropdown.Item
                      key={i}
                      eventKey={i}
                      active={(user.activeParentZone) ? (user.activeParentZone.id === child.id) : false}>
                      <Image domain="server" src={child.ProfilePicture} alt={child.FullName} />
                      <span>{child.FullName}</span>
                    </Dropdown.Item>;
                  })
                }
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Notification />
        </div>
      </div>
      <div className="app-header-tab-filter">
        <div className="header-tabs">
          <Tab.Container id="zone-tabs" onSelect={onSelect} activeKey={activeTab}>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="news-feed">News Feed</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="performance">Performance</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="profile">Profile</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="my-school">My School</Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </div>
      </div>
    </div>
  </>;
}

Header.propTypes = {
  defaultActiveTab: PropTypes.string,
  onSelectTab: PropTypes.func
};

function Zone() {

  const tabs = ['news-feed', 'performance', 'profile', 'my-school'];
  const tab: any = useParams().tab || 'news-feed';
  const defaultActiveTab = (tabs.includes(tab)) ? tab : 'news-feed';
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const [newsFeedEleRef, newsFeedIsVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [performanceEleRef, performanceIsVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [detailEleRef, detailIsVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [mySchoolEleRef, mySchoolIsVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const location = useLocation();
  const returnTo = (location.state as { returnTo: string })?.returnTo || "/";
  // const user = useAuth().user();

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  useEffect(() => {
    onSelectTab(defaultActiveTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveTab]);

  return <>
    <div className={'app-parent-zone'}>
      <div className={'right-main-content'}>
        <Header returnTo={returnTo} defaultActiveTab={defaultActiveTab} onSelectTab={onSelectTab} />
        <div className={`main-content ${activeTab}` + (['news-feed'].includes(activeTab) ? ' app-inner' : '')}>
          <Tab.Container id="zone-tabs" activeKey={activeTab}>
            <Tab.Content>
              <Tab.Pane eventKey="news-feed">
                <div className='tab-news-feed' ref={newsFeedEleRef}>
                  {
                    (newsFeedIsVisible)
                      ? <NewsFeed />
                      : null
                  }
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="performance">
                <div className='tab-performance' ref={performanceEleRef}>
                  {
                    (performanceIsVisible)
                      ? <Performance />
                      : null
                  }
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="profile">
                <div className='tab-profile' ref={detailEleRef}>
                  {
                    (detailIsVisible)
                      ? <Detail />
                      : null
                  }
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="my-school">
                <div className='tab-my-school' ref={mySchoolEleRef}>
                  {
                    (mySchoolIsVisible)
                      ? <MySchool />
                      : null
                  }
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </div>
  </>;
}

export default Zone
