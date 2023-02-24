import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { BsBackspace } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { useStateMounted } from '../../../../Core/Hooks';
import { useAuth } from '../../../../Core/Providers';
import { ParentService, SetPinParam } from '../../../../Services/ParentService';
import { Link } from 'react-router-dom';
import './Login.scss'

function Login() {

  const passwordRef = useRef<any>(null);
  const [password, setPassword] = useStateMounted(new Array(4).fill(''));
  const [index, setIndex] = useStateMounted(0);
  const [codeTitle, setCodeTitle] = useStateMounted("Enter your code");
  const [errorMessage, setErrorMessage] = useStateMounted<string | null>(null);
  const [createPassword, setCreatePassword] = useStateMounted<string | null>(null);
  const parentService = new ParentService();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user();

  const getPupil = () => {
    return user.childrenList.filter((c) => c.id === user.id)[0];
  };

  const handleChange = (e) => {
    let value = e.target.value.trim();
    setPassword((prev) => {
      value = (value && value.length > 1) ? value.slice(0, 1) : value;
      prev[index] = (value) ? Number(value) : value;
      return [...prev];
    });
    if (value !== '') {
      setIndex((prev) => {
        return (prev === 3) ? 3 : prev + 1;
      });
    }
  };

  const selectValue = (v) => {
    setPassword((prev) => {
      prev[index] = v;
      return [...prev];
    });
    setIndex((prev) => {
      return (prev === 3) ? 3 : prev + 1;
    });
  }

  const removeValue = () => {
    setPassword((prev) => {
      prev[index] = '';
      return [...prev];
    });
    setIndex((prev) => {
      return (prev === 0) ? 0 : prev - 1;
    });
  }

  const createConfirmPassword = async (str) => {
    if (!createPassword) {
      setCreatePassword(str);
      setPassword([...password.map((v) => "")])
      passwordRef.current.childNodes[0].focus();
    }
    else {
      if (str === createPassword) {
        setErrorMessage("")
        const payload: SetPinParam = {
          MobileNumber: user.MobileNumber,
          PinPassword: Number(str),
        };
        await parentService.setPin(payload)
          .then((res) => {
            user.setPinPassword(res.PinPassword);
            const pupil = getPupil();
            user.setActiveParentZone(pupil);
            auth.setUser(user)
              .then(() => {
                navigate('/parents/zone', { replace: true });
              })
              .catch(() => { });
          })
          .catch((e) => {
            if (e.type === 'client') {
              setErrorMessage(e.message);
            } else {
              setErrorMessage('System error occurred!! please try again.');
            }
          });
      }
      else {
        setErrorMessage("Code should be same");
      }
    }
  }

  useEffect(() => {
    user.setActiveParentZone(null);
    auth.setUser(user)
      .then(() => { })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const str = password.join('');
    if (str.length === 4) {
      if (user.PinPassword) {
        if (user.PinPassword === Number(str)) {
          setErrorMessage(null);
          const pupil = getPupil();
          user.setActiveParentZone(pupil);
          auth.setUser(user)
            .then(() => {
              navigate('/parents/zone', { replace: true });
            })
            .catch(() => { });
        }
        else {
          setErrorMessage("Please enter valid code");
        }
      }
      else {
        createConfirmPassword(str);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.childNodes[index].focus();
    }
  }, [index, passwordRef]);

  useEffect(() => {
    if (!user.PinPassword) {
      if (!createPassword) {
        setCodeTitle("Create your code");
      }
      else {
        setCodeTitle("Confirm your code");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeTitle, user]);

  return <>
    <div className='app-pupil-zone-login'>
      <div className='login-container'>
        <div className='code-title'>
          <h1>{codeTitle}</h1>
          <p> {(errorMessage) ? errorMessage : null}</p>
        </div>
        <div ref={passwordRef} className="password-container">
          {
            [...Array(4)].map((val, i) => {
              return (
                <Form.Control
                  type="number"
                  className="password-field"
                  name="password"
                  value={password[i]}
                  key={i}
                  onFocus={e => setIndex(i)}
                  onChange={e => handleChange(e)}
                  autoComplete="off"
                />
              );
            })
          }
        </div>
        <div className='number-pad'>
          {
            [[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((item, k) => {
              return (
                <ul key={`row-${k}`}>
                  {
                    item.map((v, i) => {
                      return (
                        <li key={`col-${k}-${i}`}>
                          <button onClick={() => selectValue(v)}>{v}</button>
                        </li>
                      )
                    })
                  }
                </ul>
              );
            })
          }
          <ul>
            <li>
              <Link className="logout-link" to={'/parents'}>Back</Link>
            </li>
            <li>
              <button onClick={() => selectValue("0")}>0</button>
            </li>
            <li>
              <button id="back-button" onClick={() => removeValue()}><BsBackspace /></button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </>;
}

export default Login
