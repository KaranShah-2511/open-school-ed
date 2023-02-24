import React, { useEffect } from 'react'
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { Nav, Tab } from 'react-bootstrap';
import AvatarIcon from '../AvatarIcon';
import { Image } from '../../../../Components';
import { Rewards, PupilService, Avatar, PupilAvatar, AvatarParam } from '../../../../Services/PupilService';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { Button } from 'react-bootstrap';
import './CreateAvatar.scss'

function Heading() {
  return <>
    <h2 className="header-title">My Avatar</h2>
  </>;
};

function CreateAvatar() {

  const layout = useLayout();
  const defaultActiveTab = 'colour';
  const excludePart = ['clothes'];
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [activeTab, setActiveTab] = useStateMounted(defaultActiveTab);
  const pupilService = new PupilService();
  const user = useAuth().user();
  const [rewards, setRewards] = useStateMounted<Rewards>();
  const [error, setError] = useStateMounted<string | null>(null);
  const [avatarPart, setAvatarPart] = useStateMounted<{ colour?: any, hair?: any, eyes?: any, mouth?: any, clothes?: any }>();
  const [avatar, setAvatar] = useStateMounted<Avatar[]>([]);
  const [showError, setShowError] = useStateMounted<string | null>(null);

  const onSelect = (key) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  };

  useEffect(() => {
    getRewards();
    getPupilAvatar();
    getAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRewards = async () => {
    await pupilService.getPupilRewards(user.UserDetialId)
      .then((res) => {
        setRewards(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
  };

  const getPupilAvatar = async () => {
    await pupilService.getPupilAvatar(user.UserDetialId)
      .then((res) => {
        const userAvatar = {};
        // let userAvatar ;
        res.map((item) => {
          if (!excludePart.includes(item.Type)) {
            userAvatar[item.Type] = {
              image: item.Images,
              point: item.Point,
              id: item.id
            }
          }
        });
        setAvatarPart(userAvatar);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
  };

  const onRefresh = () => {
    (async () => {
      await getAvatar();
      await getRewards();
    })();
  }

  const getAvatar = async () => {
    await pupilService.getAvatars(user.UserDetialId)
      .then((res) => {
        setAvatar(res);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
  }
  useEffect(() => {
    if (avatar.length && avatarPart?.colour == undefined) {
      // if (avatar.length && !avatarPart) {
      const userAvatar = {};
      avatar.map((item) => {
        if (!excludePart.includes(item.Type) && item.imglist && item.imglist.length) {
          userAvatar[item.Type] = {
            image: item.imglist[0].Images,
            point: item.imglist[0].Point,
            id: item.imglist[0]._id
          }
        }
      });
      setAvatarPart(userAvatar);
    }
  }, [avatar, avatarPart]);

  const saveAvatarPart = async () => {

    const data: AvatarParam = {
      AvatarIdList: [
        {
          AvatarId: avatarPart?.colour['id']
        },
        {
          AvatarId: avatarPart?.hair['id']
        },
        {
          AvatarId: avatarPart?.eyes['id']
        },
        {
          AvatarId: avatarPart?.mouth['id']
        }
      ]
    }
    pupilService.updataAvatar(user.UserDetialId, data)
      .then((res) => {
        console.log("update success fully ", res)
      })
      .catch((e) => {
        if (e.type === 'client') {
          setShowError(e.message);
        } else {
          setShowError('System error occurred!! please try again.');
        }
      });
  };

  useEffect(() => {
    const heading = <><Heading /></>;
    const headerRight = <>
      <Button className="mr-1 save-btn" onClick={saveAvatarPart} variant="success" type="button">Save Avatar</Button>
    </>;
    layout.clear().set({
      heading: heading,
      headerClass: 'app-inner',
      headerRight: headerRight,
      mainContentClass: 'app-inner',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, avatarPart]);

  return (
    <div className="main-container">
      <div className="left-container">
        <div className='point-start'>
          <div className="point-container">
            <div className="points">
              <div>Your stars convert to</div>
              <div className='total-points'>
                <p className="header-title">{rewards?.point} Points</p>
              </div>
            </div>
          </div>
          <div className="reward-container">
            <div className="reward">
              <div className="star gold-star">
                <p className="header-title">{rewards?.gold}</p>
              </div>
              <p>Gold Star</p>
            </div>
            <div className="reward">
              <div className="star silver-star">
                <p className="header-title">{rewards?.silver}</p>
              </div>
              <p>Silver Star</p>
            </div>
            <div className="reward">
              <div className="star bronze-star">
                <p className="header-title">{rewards?.bronze}</p>
              </div>
              <p>Bronze Star</p>
            </div>
          </div>
        </div>
        <div className="avatar-container">
          <div className="character">
            <div className="main-avtar">
              <div className="colour">
                {
                  (avatarPart && avatarPart.colour)
                    ? <Image domain="server"
                      src={avatarPart.colour.image}
                      alt=''
                      className={'colour-' + (avatarPart.colour.point || '')} />
                    : null
                }
              </div>
              <div className="avatarMaterial">
                {
                  (avatarPart)
                    ?
                    Object.keys(avatarPart).map((type) => {
                      return (type !== 'colour')
                        ? <div key={type} className={type}>
                          <Image domain="server"
                            src={avatarPart[type].image}
                            alt=''
                            className={type + '-' + (avatarPart[type].point || '')} />
                        </div>
                        : null
                    })
                    : null
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="inner-right">
          <div className="app-header-tab-filter">
            <div className="header-tabs">
              <Tab.Container id="zone-tabs" onSelect={onSelect} activeKey={activeTab}>
                <Nav variant="pills">
                  {
                    avatar.map((part) => {
                      return (!excludePart.includes(part.Type))
                        ? <Nav.Item key={part.Type}>
                          <Nav.Link eventKey={part.Type}>{part.Type}</Nav.Link>
                        </Nav.Item>
                        : null
                    })
                  }
                </Nav>
              </Tab.Container>
            </div>
          </div>
          <div className={`main-content ${activeTab}` + (['colour'] ? ' app-inner' : '')}>
            <Tab.Container id="zone-tabs" activeKey={activeTab}>
              <Tab.Content>
                {
                  avatar.map((part) => {
                    return (!excludePart.includes(part.Type))
                      ? <Tab.Pane key={part.Type} eventKey={part.Type}>
                        <AvatarIcon
                          onRefresh={onRefresh}
                          avatar={part.imglist}
                          type={part.Type}
                          setData={(image, point, id) => setAvatarPart((prevPart: any) => {
                            prevPart[part.Type] = { image, point, id };
                            return { ...prevPart };
                          })} />
                      </Tab.Pane>
                      : null
                  })
                }
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAvatar
