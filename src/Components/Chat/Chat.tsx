import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Button, Form } from 'react-bootstrap';
import { usePubNub } from 'pubnub-react';
import Scrollbars from 'react-custom-scrollbars';
import { useStateMounted } from '../../Core/Hooks';
import Image from '../Image';
import moment from 'moment';
import { FiSend } from 'react-icons/fi';
import './Chat.scss';

type ChatProps = {
  channels: string[];
  sender: { Name: string, Profile: string };
  receiver?: { Name: string, Profile: string };
};

const propTypes = {
  channels: PropTypes.array,
  sender: PropTypes.object,
  receiver: PropTypes.object
};

function Chat(props: ChatProps) {

  const { channels, sender, receiver } = props;

  const pubnub = usePubNub();
  const uuid = pubnub.getUUID();
  const [_channels, setChannels] = useStateMounted<string[]>([]);
  const [_sender, setSender] = useStateMounted<{ Name: string, Profile: string }>(sender);
  const [_receiver, setReveiver] = useStateMounted<{ Name: string, Profile: string }>();
  const [messages, setMessage] = useStateMounted<any[]>([]);
  const isSubscribe = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const chatEleRef = useRef<Scrollbars>(null);

  // useEffect(() => {
  //   return () => {
  //     if (isSubscribe.current === true && _channels && _channels.length) {
  //       pubnub.removeListener({ message: handleMessage });
  //       pubnub.unsubscribe({ channels });
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (channels && channels.length) {
      setChannels(channels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels]);

  useEffect(() => {
    if (sender) {
      setSender(sender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sender]);

  useEffect(() => {
    if (receiver) {
      setReveiver(receiver);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiver]);

  const handleMessage = (event) => {
    if (_channels && !_channels.includes(event.channel)) return;
    if (typeof event.message === 'string' || event.message.hasOwnProperty('text')) {
      const profile = event.message.split('#@#')[2];
      const name = event.message.split('#@#')[1];
      const message = event.message.split('#@#')[0];
      const time = new Date(((event.timetoken / 10000000) * 1000));
      setMessage(messages => [...messages, { ...event, profile, name, message, time }]);
      if (chatEleRef && chatEleRef.current) {
        chatEleRef.current.scrollToBottom();
      }
    }
  };

  useEffect(() => {
    if (isSubscribe.current === false && _channels && _channels.length) {
      pubnub.addListener({ message: handleMessage });
      pubnub.subscribe({ channels });
      isSubscribe.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubnub, _channels, isSubscribe]);

  const frmSubmit = (e) => {
    if (formRef.current) {
      if (typeof formRef.current.requestSubmit === 'function') {
        formRef.current.requestSubmit();
      } else {
        formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    const _message = [values.message.trim()];
    _message.push(_sender.Name);
    _message.push(_sender.Profile);
    const message = _message.join('#@#');
    channels.forEach((channel) => {
      pubnub
        .publish({ channel: channel, message })
        .then(() => resetForm({}))
        .catch((e) => {
        });
    });
  }

  const formlik = {
    validationSchema: yup.object().shape({
      message: yup.string().trim().required('Type a message')
    }),
    initialValues: { message: '' },
    onSubmit: onSubmit
  };

  return (
    <div className='app-chat'>
      <Formik {...formlik}>
        {
          ({ handleSubmit, touched, values, handleChange, isSubmitting, errors }) => (
            <Form ref={formRef} onSubmit={handleSubmit}>
              <Scrollbars className="chat-area" ref={chatEleRef} autoHide hideTracksWhenNotNeeded style={{ height: 420 }}>
                <div className='scroll-area' style={{ minHeight: 420 }}>
                  <div className='messages'>
                    {
                      messages.map((message, index) => {
                        return (
                          <div
                            key={`message-${index}`}
                            className={'message ' + ((uuid === message.publisher) ? 'sender' : 'receiver')}>
                            <div className='chat-message-area'>
                              <Image domain='server' src={message.profile} alt={message.name} />
                              <div className='chat-massage-profile-area'>
                                <div className='chat-profile-area'>
                                  <span className='profile-name'>{message.name}</span>
                                  <span className='message-time'>{moment(message.time).format('HH:mm')}</span>
                                </div>
                                <div className='chat-massage-area'>{message.message}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </Scrollbars>
              <div className="chat-input">
                <div className="form-group">
                  <Form.Control
                    as="textarea"
                    name='message'
                    onChange={handleChange}
                    value={values.message}
                    isValid={touched.message && !errors.message}
                    isInvalid={!!errors.message}
                    placeholder={(_receiver && _receiver.Name) ? `Message ${_receiver.Name}...` : 'Type a message'}
                    rows={3}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        frmSubmit(e);
                      }
                    }} />
                  <div className={'app-chat-attachments'}>
                    <Button className="chat-icons" type='submit'><FiSend className="send-msg" /></Button>
                  </div>
                </div>
              </div>
            </Form>
          )}
      </Formik>
    </div >
  );
}

Chat.propTypes = propTypes;

export default Chat;