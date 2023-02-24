import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Element/Sidebar';
import Header from './Element/Header';
import { useLayout } from '../../Core/Providers/LayoutProvider';
import type { Location } from "history";
import './Default.scss';

type DefaultProps = {
  location?: Location;
};

function Default(props: DefaultProps) {

  const [appWrapperClass, setAppWrapperClass] = useState<any | null>(null);
  const [mainContentClass, setMainContentClass] = useState<any | null>(null);
  const [navToggle, setNavToggle] = useState();
  const layout = useLayout();

  useEffect(() => {
    (async () => {
      await layout.data.subscribe((res: any) => {
        setMainContentClass(null);
        setAppWrapperClass(null);
        if (res.mainContentClass !== undefined) { setMainContentClass(res.mainContentClass); }
        if (res.appWrapperClass !== undefined) { setAppWrapperClass(res.appWrapperClass); }
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNavToggle = (event: any) => {
    setNavToggle(event);
  };

  return (
    <div className={'app-wrapper ' + (appWrapperClass || '')}>
      <Sidebar onToggle={onNavToggle} />
      <div className={'right-main-content' + ((navToggle) ? ' toggle' : '')}>
        <Header />
        <div className={'main-content ' + (mainContentClass || '')}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Default;
