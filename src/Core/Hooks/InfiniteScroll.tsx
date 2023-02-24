/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { debounce } from 'lodash';
import { RefObject, useEffect, useRef } from 'react';
import useStateMounted from './StateMounted';

function useInfiniteScroll(
  delay?: number,
  handler?: (event: WindowEventMap | HTMLElementEventMap | Event, element: HTMLElement) => void,
  element?: RefObject<HTMLDivElement>
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {

  const delayTime = (delay) ? delay : 100;
  const [isScroll, setScroll] = useStateMounted<boolean>(false);
  const refHandler = useRef<typeof handler>()

  const handleScroll = (event) => {

    const _element = (element?.current) ? element?.current : document.documentElement;

    if (!!refHandler?.current) {
      refHandler.current(event, _element);
      return;
    }
    const isBottom = (_element.scrollHeight - _element.scrollTop) <= _element.clientHeight;

    if (!isBottom || isScroll) return;
    setScroll(true);

  }

  useEffect(() => {

    const targetElement: HTMLDivElement | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    if (((typeof handler) === 'function') && refHandler.current !== handler) {
      refHandler.current = handler;
    }

    targetElement.addEventListener('scroll', debounce(handleScroll, delayTime));
    return () => {
      targetElement.removeEventListener('scroll', debounce(handleScroll, delayTime))
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  return [isScroll, setScroll];
}

export default useInfiniteScroll;