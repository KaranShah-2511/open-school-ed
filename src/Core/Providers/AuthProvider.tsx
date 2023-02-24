/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import React from 'react'
import { User } from '../../Services/UserService';
import { Auth } from '../Services/AuthService'

interface AuthContextInterface {
  isAuth: (() => boolean);
  user: (() => User);
  setUser: ((u: User) => Promise<User | boolean>);
  logout: (() => Promise<boolean>);
}

const AuthContext = React.createContext<AuthContextInterface | null>(null);

class AuthProvider extends React.Component<{}, AuthContextInterface> {

  constructor(props: any) {
    super(props)
    this.state = {
      isAuth: this.isAuth,
      user: this.user,
      setUser: this.setUser,
      logout: this.logout
    };
  }

  isAuth = (): boolean => {
    return Auth.isAuthorized();
  }

  user = (): User => {
    return Auth.getUser();
  }

  setUser = (user: User): Promise<User | boolean> => {
    return Auth.setUser(user);
  };

  logout = () => {
    return Auth.logout();
  };

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer

function useAuth() {
  const auth = React.useContext(AuthContext)
  if (!auth) {
    throw new Error('useAuth must be used within a AuthProvider.')
  }
  return auth;
}

export { AuthProvider, AuthConsumer, AuthContext, useAuth }
