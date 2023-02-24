import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { BsLockFill } from "react-icons/bs";
import { Image } from '../../../../Components';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { Avatar, AvatarImageParam, PupilService, Rewards } from '../../../../Services/PupilService';
import './AvatarIcon.scss';

type AvatarProps = {
  avatar: Avatar[];
  type: string;
  onRefresh: () => void;
  setData: ((image: any, point: any, id: any) => void);
}
const propTypes = {
  onRefresh: PropTypes.func
};


function AvatarIcon(props: AvatarProps) {
  const user = useAuth().user();
  const { avatar, type, setData } = props;
  const pupilService = new PupilService();
  const [_avatar, setAvatar] = useStateMounted<Avatar[]>([]);
  const [error, setError] = useStateMounted<string | null>(null);
  const [rewards, setRewards] = useStateMounted<Rewards>();

  useEffect(() => {
    setAvatar(avatar);
    getRewards();
  }, [avatar]);

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

  const buyImage = async (imageId: string | number, imagePoint: number) => {

    const data: AvatarImageParam = {
      Id: imageId,
      PupilId: user.UserDetialId,
      Point: imagePoint
    }
    await pupilService.getAvatarImage(data)
      .then((res) => {
        props.onRefresh();
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
  }

  const confirmation = (id: string | number, point: number) => {
    const userPoint: any = rewards?.point;
    if (userPoint >= point) {
      const confirmBox = window.confirm(
        "Do you really want to unlock this?"
      )
      if (confirmBox === true) {
        buyImage(id, point)
      }
    }
    else {
      alert("Sorry, you don't have enough points to unlock this item")
    }
  }

  return (
    <div className={"avatar-part " + (type + '-part')}>
      {_avatar.map((item: any, i) => {
        return (
          <div key={i} className="img-box">
            {(item.IsGet || item.Point === 5)
              ?
              <button onClick={() => setData(item.Images, item.Point, item._id)}  >
                <Image domain="server" src={item.Images} alt='' />
              </button>
              :
              <button  onClick={() => confirmation(item._id, item.Point)} >
                <div className="lock-images">
                  <Image domain="server" src={item.Images} alt='' />
                  <p id='point'>{item.Point} points</p>
                  <div className='lock'>
                    <div className="black"></div>
                    <div className="svg">
                      <BsLockFill />
                    </div>
                  </div>
                </div>
              </button>
            }
          </div>
        )
      })}
    </div >
  )
}
AvatarIcon.propTypes = propTypes;
export default AvatarIcon;
