import React, { useEffect, useState } from 'react';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import Notification from '../../Components/Notification';
import './Header.scss';

function Header() {

  const [headerClass, setHeaderClass] = useState<any | null>(null);
  const [header, setHeader] = useState<any | null>(null);
  const [beforeHeader, setBeforeHeader] = useState<any | null>(null);
  const [headerRight, setHeaderRight] = useState<any | null>(null);
  const [afterHeader, setAfterHeader] = useState<any | null>(null);
  const [heading, setHeading] = useState<any | null>(null);
  const [showNotification, setShowNotification] = useState<any | boolean>(true);
  const layout = useLayout();

  const resetState = () => {
    setHeaderClass(null);
    setHeader(null);
    setHeading(null);
    setHeaderRight(null);
    setBeforeHeader(null);
    setAfterHeader(null);
  };

  useEffect(() => {
    (async () => {
      await layout.data.subscribe((res) => {
        resetState();
        if (res.headerClass !== undefined) { setHeaderClass(res.headerClass); }
        if (res.header !== undefined) { setHeader(res.header); }
        if (res.heading !== undefined) { setHeading(res.heading); }
        if (res.headerRight !== undefined) { setHeaderRight(res.headerRight); }
        if (res.beforeHeader !== undefined) { setBeforeHeader(res.beforeHeader); }
        if (res.afterHeader !== undefined) { setAfterHeader(res.afterHeader); }
        if (res.showNotification !== undefined) { setShowNotification(res.showNotification); }
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {
        (header)
          ? (
            <>
              {beforeHeader}
              {header}
              {afterHeader}
            </>
          )
          : (
            <div className={'app-header-outer sticky-md-top ' + (headerClass || '')}>
              {beforeHeader}
              <div className="app-header">
                {heading}
                <div className="app-header-right">
                  {headerRight}
                  {(showNotification) ? <Notification /> : null}
                </div>
              </div>
              {afterHeader}
            </div>
          )
      }
    </>
  );
}

export default Header;
