import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { Rewards, PupilService, PupilAvatar, Avatar } from '../../../../Services/PupilService';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useStateMounted } from '../../../../Core/Hooks';
import { Image } from '../../../../Components';
import './MyAvatar.scss';

function MyAvatar() {

  const navigate = useNavigate();
  const pupilService = new PupilService();
  const excludePart = ['clothes'];
  const user = useAuth().user();
  const [rewards, setRewards] = useStateMounted<Rewards>();
  const [error, setError] = useStateMounted<string | null>(null);
  const [avatarPart, setAvatarPart] = useStateMounted<{ colour?: any, hair?: any, eyes?: any, mouth?: any, clothes?: any }>();
  const [avatar, setAvatar] = useStateMounted<Avatar[]>([]);

  useEffect(() => {
    getRewards();
    getPupilAvatar();
    getAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className='main-deshboard-container'>
      <div className="left-deshboard-container">
        <div className='point-deshboard-star'>
          <div className="point-deshboard-container">

          </div>
          <div className="points">
            <div className='title'>Your stars convert to</div>
            <div className='total-points'>
              <p className="header-title">{rewards?.point} Points</p>
            </div>
          </div>
          <div className="reward-deshboard-container">
            <div className="reward">
              <div className="star gold-star">
                <p className="header-title">{rewards?.gold}</p>
              </div>
              <p>Gold Star</p>
            </div>
            <div className="reward">
              <div className="star silver-star">
                <p className="header-title"> {rewards?.silver} </p>
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
          <div className="see-avatar">
            <Button className="mr-1 btn btn-success" onClick={() => navigate('/avatar')} type="button">View Avatar</Button>
          </div>
        </div>
      </div>
      <div className="right-deshboard-container">
        <div className="deshboard-mainAvtar">
          <div className="deshboard-avatarMaterial">
            {
              (avatarPart)
                ?
                Object.keys(avatarPart).map((type) => {
                  return (type)
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
  )
}

export default MyAvatar
