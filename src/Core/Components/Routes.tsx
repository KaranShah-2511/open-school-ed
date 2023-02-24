/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router';
import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom';
import _ from 'lodash';

export type RouteProps = {
  path: string;
  to?: string;
  private?: boolean;
  element?: React.ReactNode | any | null;
  isAuthTo?: string;
  props?: any;
  redirect?: string;
  index?: boolean;
}

type RoutesProps = {
  routes: RouteProps[];
  isAuthorized?: boolean;
  redirect?: string;
  location?: object;
  layout?: JSX.Element | any | null;
  loading?: any;
  notFound: string;
  defaultProps?: object;
}

const propTypes = {
  routes: PropTypes.array.isRequired,
  isAuthorized: PropTypes.bool,
  redirect: PropTypes.string,
  location: PropTypes.object,
  layout: PropTypes.any,
  loading: PropTypes.any,
  notFound: PropTypes.string.isRequired,
  defaultProps: PropTypes.object,
};

function Routes(props: RoutesProps) {

  let {
    routes,
    isAuthorized,
    location,
    redirect,
    layout,
    loading,
    notFound,
    defaultProps
  } = props;
  const Layout = (layout) ? layout : <Outlet />;
  loading = (loading) ? loading : <></>;

  return (
    <>
      <ReactRoutes>
        <Route element={((typeof Layout) === 'function') ? <Layout location={location} /> : Layout}>
          <>
            {
              routes.map((route, i: number) => {
                const authTo = (route.redirect) ? route.redirect : ((redirect) ? redirect : '');
                let routeProps = _.omit(route, ['element', 'private', 'props']);
                routeProps = (defaultProps) ? _.assign(defaultProps, routeProps) : routeProps;
                const elementProps = _.assign(routeProps, route.props);
                if (route.to) {
                  return <Route key={i} {...routeProps} element={
                    (
                      (route.private)
                        ? (
                          (isAuthorized)
                            ? <Navigate replace={true} to={route.to} state={{ from: location, path: route.path }} />
                            : <Navigate to={authTo} state={{ from: location }} />
                        )
                        : (
                          (route.isAuthTo && isAuthorized)
                            ? <Navigate replace={true} to={route.isAuthTo} state={{ from: location }} />
                            : <Navigate replace={true} to={route.to} state={{ from: location }} />
                        )
                    )
                  } />;
                } else if (route.private) {
                  return <Route key={i} {...routeProps} element={
                    (
                      (isAuthorized)
                        ? <Suspense fallback={loading}><route.element {...elementProps} /></Suspense>
                        : <Navigate to={authTo} state={{ from: location }} />
                    )
                  } />;
                } else {
                  return <Route key={i} {...routeProps} element={
                    (
                      (route.isAuthTo && isAuthorized)
                        ? <Navigate replace={true} to={route.isAuthTo} state={{ from: location }} />
                        : <Suspense fallback={loading}><route.element {...elementProps} /></Suspense>
                    )
                  } />
                }
              })
            }
            <Route path="*" element={
              <Navigate replace={true} to={notFound} state={{ from: location }} />
            } />;
          </>
        </Route>
      </ReactRoutes>
    </>
  );
}

Routes.propTypes = propTypes;

export default Routes;
