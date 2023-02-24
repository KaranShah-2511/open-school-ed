import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
const comman: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Pupil')),
    index: true
  },
  {
    path: '/login',
    element: lazy(() => import('../Pages/Login'))
  },
  {
    path: '/zone',
    to: '/parents/login'
  }
];

/** zone Route */
const zone: RouteProps[] = [
  {
    path: '/zone',
    element: lazy(() => import('../Pages/Zone')),
    index: true
  },
  {
    path: '/zone/:tab',
    element: lazy(() => import('../Pages/Zone'))
  },
  {
    path: '/edit-pupil',
    element: lazy(() => import('../Pages/EditProfile'))
  },
];
const routes = { comman, zone };

export default routes;