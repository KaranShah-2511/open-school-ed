/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { useEffect, useRef, useState } from 'react';

function useStateMounted<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>];
function useStateMounted<S = undefined>(initialState?: S): [S | undefined, React.Dispatch<React.SetStateAction<S | undefined>>];
function useStateMounted<S>(initialState?: S) {
  const [_state, _setState] = useState(initialState);
  const isMounted = useRef(false);

  const setState = (value: any) => {
    if (isMounted.current) {
      _setState(value);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, [])

  return [_state, setState];
}

export default useStateMounted;