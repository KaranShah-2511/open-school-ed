import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { Nav, Tab } from 'react-bootstrap';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted, useVisibility } from '../../../../Core/Hooks';
import { useParams } from 'react-router';
import { General, TeacherChat, /* Profile, */ } from '../../Components';
import { useAuth } from '../../../../Core/Providers';
import Chat from '../../../../Components/Chat';
import './Settings.scss';

function Heading() {
  return <>
    <h2 className="header-title">Settings & Profile</h2>
  </>;
};

type AfterHeaderProps = {
  utype: string;
  defaultActiveTab: string;
  onSelectTab: ((key: any) => void);
}

function AfterHeader(props: AfterHeaderProps) {

  const { utype, defaultActiveTab, onSelectTab } = props;

  const [activeTab, setActiveTab] = useStateMounted();

  const onSelect = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

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
    <div className="app-header-tab-filter">
      <div className="header-tabs">
        <Tab.Container id="setting-tabs" onSelect={onSelect} activeKey={activeTab}>
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="general">General</Nav.Link>
            </Nav.Item>
            {/* <Nav.Item>
              <Nav.Link eventKey="profile">Profile</Nav.Link>
            </Nav.Item> */}
            {
              (utype === 'teacher')
                ? <>
                  <Nav.Item>
                    <Nav.Link eventKey="school-chat">School Chat</Nav.Link>
                  </Nav.Item>
                </>
                : null
            }
            {
              (utype === 'pupil')
                ? <>
                  <Nav.Item>
                    <Nav.Link eventKey="teacher-chat">Teacher Chat</Nav.Link>
                  </Nav.Item>
                </>
                : null
            }
          </Nav>
        </Tab.Container>
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  utype: PropTypes.string,
  defaultActiveTab: PropTypes.string,
  onSelectTab: PropTypes.func
};

function Settings(props) {

  const tabs = ['general', 'profile', 'school-chat', 'teacher-chat'];
  const defaultActiveTab = useParams().tab || 'general';
  const [generalEleRef, isGeneralVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  // const [profileEleRef, isProfileVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [teacherChatEleRef, isTeacherChatVisible] = useVisibility<HTMLDivElement>({ threshold: 0 });
  const [loading] = useStateMounted<boolean>(false);
  const [activeTab, setActiveTab] = useStateMounted<string>(defaultActiveTab);
  const layout = useLayout();
  const user = useAuth().user();

  const onSelectTab = (key) => {
    setActiveTab(key);
  }

  useEffect(() => {
    if (defaultActiveTab && tabs.includes(defaultActiveTab)) {
      onSelectTab(defaultActiveTab);
    } else {
      onSelectTab('general');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveTab]);

  useEffect(() => {
    const heading = <>
      <Heading />
    </>;
    const afterHeader = <>
      <AfterHeader utype={user.userType.Type} defaultActiveTab={defaultActiveTab} onSelectTab={onSelectTab} />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'app-inner',
      mainContentClass: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, defaultActiveTab, user]);

  return (
    <>
      <Helmet>
        <title>Settings & Profile</title>
      </Helmet>
      <div className="app-setting">
        <Tab.Container id="setting-tabs" activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="general">
              <div ref={generalEleRef}>
                {
                  (isGeneralVisible)
                    ? <General utype={props.uType} />
                    : null
                }
              </div>
            </Tab.Pane>
            {/* <Tab.Pane eventKey="profile">
              <div ref={profileEleRef}>
                {
                  (isProfileVisible)
                    ? <Profile utype={props.uType} />
                    : null
                }
              </div>
            </Tab.Pane> */}
            {
              (user.userType.Type === 'teacher')
                ? <>
                  <Tab.Pane eventKey="school-chat">
                    <Chat
                      channels={[(user.SchoolId + '_' + user.id)]}
                      sender={{ Name: user.FullName, Profile: user.ProfilePicture }}
                    />
                  </Tab.Pane>
                </>
                : null
            }
            {
              (user.userType.Type === 'pupil')
                ? <>
                  <Tab.Pane eventKey="teacher-chat">
                    <div ref={teacherChatEleRef}>
                      {
                        (isTeacherChatVisible)
                          ? <TeacherChat />
                          : null
                      }
                    </div>
                  </Tab.Pane>
                </>
                : null
            }
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
}

export default Settings;
