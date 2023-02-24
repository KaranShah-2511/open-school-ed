/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import React from 'react';

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong:( </h1>;
    } else {
      return this.props.children;
    }
  }
}

export default ErrorBoundary;