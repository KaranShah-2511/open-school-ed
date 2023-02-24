/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { useEffect } from 'react';
import useStateMounted from './StateMounted';
import { Platform } from '../Utility';

function useNetwork(): boolean {

  const isOnline = (Platform.isBrowser() && typeof window.navigator.onLine === 'boolean') ? window.navigator.onLine : true;

  const [online, setOnline] = useStateMounted(isOnline);

  const onOnline = (event: Event) => {
    setOnline(true);
  };

  const onOffline = (event: Event) => {
    setOnline(false);
  }

  useEffect(() => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return online;
}

export default useNetwork;