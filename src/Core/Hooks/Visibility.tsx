/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { useEffect, useRef } from 'react';
import useStateMounted from './StateMounted';

function useVisibility<T>(options: IntersectionObserverInit): [React.RefObject<T>, boolean] {

  const [isVisible, setVisible] = useStateMounted<boolean>(false);
  const element = useRef<any>(null)

  const callHandler: IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setVisible(true);
      observer.disconnect();
    }
  }
  useEffect(() => {
    const observer = new IntersectionObserver(callHandler, options);
    if (element.current) {
      observer.observe(element.current);
    }
    return () => {
      if (element.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(element.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, options]);

  return [element, isVisible];
}

export default useVisibility;