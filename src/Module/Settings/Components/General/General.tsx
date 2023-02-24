import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import { UserService, UserSetting } from '../../../../Services/UserService';
import { Formik } from 'formik';
import { Col, Form, Row, Toast, ToastContainer } from 'react-bootstrap';
import './General.scss';

type GeneralProps = {
  utype: string;
}

function General(props: GeneralProps) {

  const { utype } = props;

  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [success, setSuccess] = useStateMounted<string | null>(null);
  const [userSettings, setUserSettings] = useStateMounted<UserSetting[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAuth().user();
  const userService = new UserService();
  const userID = (utype === 'school') ? user.UserDetialId : user.id;

  const getUserSettings = async () => {
    setLoading(true);
    setUserSettings([]);
    await userService.getUserSetting(userID)
      .then((res) => {
        setUserSettings(res);
      })
      .catch((e) => { })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    (async () => {
      await getUserSettings();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitialValues = () => {
    const settingList = (userSettings.length)
      ? userSettings.map((item, i) => {
        return {
          SettingId: item.SettingId,
          Name: item.Name,
          Value: item.Value,
          SubType: item.SubType,
          Type: item.Type
        };
      })
      : [];
    return {
      SettingList: settingList || []
    };
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setError(null);
    setSuccess(null);
    await userService.saveSetting(userID, values)
      .then(async (res) => {
        await getUserSettings();
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
      });
  };

  const formSubmitForce = () => {
    setTimeout(() => {
      if (formRef.current) {
        if (typeof formRef.current.requestSubmit === 'function') {
          formRef.current.requestSubmit();
        } else {
          formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    }, 100);
  };

  const formlik = {
    initialValues: getInitialValues(),
    enableReinitialize: true,
    onSubmit: onSubmit
  };

  return (
    <>
      <ToastContainer className="p-3 position-fixed" position="top-center">
        <Toast
          onClose={() => { setError(null); setSuccess(null); }}
          bg={(success) ? 'success' : ((error) ? 'danger' : '')}
          show={(!!error || !!success)}
          delay={3000} autohide>
          {(error) ? <Toast.Header closeButton={true}>
            <strong className="me-auto">Error</strong>
          </Toast.Header> : null}
          <Toast.Body>
            {error}
            {success}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Formik {...formlik}>
        {
          ({ handleSubmit, values, setValues, isSubmitting }) => (
            <Form ref={formRef} onSubmit={handleSubmit}>
              <Row>
                <Col lg={9} md={12}>
                  <Row className="mb-30">
                    <div className="general-setting">
                      <label className="title-line"><span>General Settings</span></label>
                      <label className="subtitle-line"><span>Notifications</span></label>
                      <ul className='setting-ui'>
                        {(loading) ? <li>Loading ...</li> : null}
                        {
                          (userSettings.length)
                            ? userSettings.map((item, i) => {
                              if (item.Type === 'General' && item.SubType === 'Notifications') {
                                return <li key={i}>
                                  {item.Name}
                                  <Form.Check
                                    value={item.SettingId}
                                    checked={values.SettingList[i]?.Value || false}
                                    onChange={(e) => {
                                      setValues((pValue) => {
                                        pValue.SettingList[i].Value = (pValue.SettingList[i].Value) ? false : true;
                                        return pValue;
                                      });
                                      formSubmitForce();
                                    }}
                                    disabled={isSubmitting}
                                    className="success"
                                    type='switch' />
                                </li>
                              } else {
                                return null;
                              }
                            })
                            : null
                        }
                      </ul>
                      <label className="subtitle-line"><span>Accessibility</span></label>
                      <ul className='setting-ui'>
                        {(loading) ? <li>Loading ...</li> : null}
                        {
                          (userSettings.length)
                            ? userSettings.map((item, i) => {
                              if (item.Type === 'General' && item.SubType === 'Accessibility') {
                                return <li key={i}>
                                  {item.Name}
                                  <Form.Check
                                    value={item.SettingId}
                                    checked={values.SettingList[i]?.Value || false}
                                    onChange={(e) => {
                                      setValues((pValue) => {
                                        pValue.SettingList[i].Value = (pValue.SettingList[i].Value) ? false : true;
                                        return pValue;
                                      });
                                      formSubmitForce();
                                    }}
                                    disabled={isSubmitting}
                                    className="success"
                                    type='switch' />
                                </li>
                              } else {
                                return null;
                              }
                            })
                            : null
                        }
                      </ul>
                    </div>
                  </Row>
                </Col>
              </Row>
            </Form>
          )
        }
      </Formik>
    </>
  );
}

General.propTypes = {
  utype: PropTypes.string.isRequired
};

export default General;
