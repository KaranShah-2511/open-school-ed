import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import Image from '../../../../Components/Image';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { Table } from 'react-bootstrap';
import { AiOutlineStar } from "react-icons/ai";
import { FaAngleRight } from "react-icons/fa";
import { useStateMounted } from '../../../../Core/Hooks';
import { Pupil, PupilService } from '../../../../Services/PupilService';
import Skeleton from 'react-loading-skeleton';
import ImgNoPupil from '../../../../Assets/Images/Svg/no-user-data.svg';
import './MyPupils.scss';

type MyPupilsProps = {
  utype: string;
}

function MyPupils(props: MyPupilsProps) {

  const { utype } = props;
  const [search] = useStateMounted<object>({ limit: 10, Filterby: -1 });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [showError, setError] = useStateMounted<string | null>(null);
  const [myPupils, setPupils] = useStateMounted<Pupil[]>([]);
  const myPupilService = new PupilService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      getPupils();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utype]);

  const getPupils = async () => {
    setLoading(true);
    setError(null);
    await myPupilService
      .getByTeacherID(user.id, search)
      .then((res) => {
        setPupils(res.pupiles);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    (utype)
      ? <>
        <div className={'app-my-pupils ' + utype + '-pupils'}>
          <div className="panel">
            <div className="panel-header">
              <div className="header-inner">
                <Image src="/assets/images/svg/pupil-icon.svg" alt="My Pupils" className="icon" />
                <h2>My Pupils</h2>
              </div>
              <div className="header-inner">
                <Link to="#" className="more-action" title="More Pupils">
                  <Image src="/assets/images/svg/more-v-white.svg" alt="More Pupils" />
                </Link>
              </div>
            </div>
            <div className="panel-body">
              <Scrollbars autoHide hideTracksWhenNotNeeded style={{ height: 520 }}>
                {
                  (loading || showError || myPupils.length)
                    ? <>
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th className="first">
                              Name
                              {(myPupils && myPupils.length) ? <span>Total {myPupils.length} students</span> : null}
                            </th>
                            <th className="text-center second">Group<span></span></th>
                            <th className="text-center third">
                              Performance
                              <span className="multiple-row">
                                <span>Engagement</span>
                                <span>Effort</span>
                              </span>
                            </th>
                            <th className="text-center four">
                              Quick Reward
                              <span className="multiple-row">
                                <span>Bronze</span>
                                <span>Silver</span>
                                <span>Gold</span>
                              </span>
                            </th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            (loading)
                              ? <>
                                {
                                  [...Array(8)].map((j, i) => {
                                    return (
                                      <tr key={i}>
                                        <td className="first">
                                          <div className="profile">
                                            <Skeleton containerClassName="skeleton" inline={true} width="30px" height="30px" />
                                            <span><Skeleton style={{ marginLeft: '15px' }} containerClassName="skeleton" inline={true} width="200px" height="30px" /></span>
                                          </div>
                                        </td>
                                        <td className="second">
                                          <Skeleton containerClassName="skeleton" inline={true} width="160px" height="24px" />
                                        </td>
                                        <td className="third">
                                          <div className="d-flex-center">
                                            <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                                            <Skeleton containerClassName="skeleton" inline={true} width="15px" height="15px" />
                                          </div>
                                        </td>
                                        <td className="four">
                                          <div className="reward">
                                            <span className="bronze"><Skeleton style={{ left: '0px' }} containerClassName="skeleton" inline={true} width="54px" height="24px" /></span>
                                            <span className="silver"><Skeleton style={{ left: '0px' }} containerClassName="skeleton" inline={true} width="45px" height="24px" /></span>
                                            <span className="gold"><Skeleton style={{ left: '0px' }} containerClassName="skeleton" inline={true} width="40px" height="24px" /></span>
                                          </div>
                                        </td>
                                        <td>
                                          <Link to="#"><Skeleton containerClassName="skeleton" inline={true} width="20px" /></Link>
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </>
                              : null
                          }
                          {
                            (showError)
                              ? <tr><td colSpan={5} className="text-danger">{showError}</td></tr>
                              : null
                          }
                          {
                            (!loading && !showError && (myPupils && myPupils.length))
                              ? (
                                myPupils.map((pupil, i) => {
                                  return (
                                    <tr key={i}>
                                      <td className="first">
                                        <div className="profile">
                                          <Image domain="server" src={pupil.ProfilePicture} alt={pupil.FullName} />
                                          <span>{pupil.FullName}</span>
                                        </div>
                                      </td>
                                      <td className="text-center second">{pupil.GroupName.join(', ')}</td>
                                      <td className="text-center third">
                                        <div className="perfomance">
                                          <span className="engagement"></span>
                                          <span className="effort"></span>
                                        </div>
                                      </td>
                                      <td className="text-center four">
                                        <div className="reward">
                                          <span className="bronze"><AiOutlineStar /><span className='count'>{pupil.getReward('bronze')}</span></span>
                                          <span className="silver"><AiOutlineStar /><span className='count'>{pupil.getReward('silver')}</span></span>
                                          <span className="gold"><AiOutlineStar /><span className='count'>{pupil.getReward('gold')}</span></span>
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <Link to={"/pupil-management/detail/" + pupil.id}><FaAngleRight /></Link>
                                      </td>
                                    </tr>
                                  );
                                })
                              )
                              : null
                          }
                        </tbody>
                      </Table>
                    </>
                    : null
                }
                {
                  (!myPupils.length && (!loading && !showError))
                    ? <>
                      <div className="app-empty-screen">
                        <div className="app-empty-icon">
                          <Image src={ImgNoPupil} alt="Pupil Empty" />
                        </div>
                        <div className="app-empty-content">
                          <h3>No pupils here yet</h3>
                          <p>Go to the pupil management section to start adding pupils</p>
                        </div>
                      </div>
                    </>
                    : null
                }
              </Scrollbars>
            </div>
          </div>
        </div>
      </>
      : null
  );
}

MyPupils.propTypes = {
  utype: PropTypes.string.isRequired
};

export default MyPupils;
