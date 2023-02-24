import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
const comman: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Settings')),
    index: true
  },
  {
    path: ':tab',
    element: lazy(() => import('../Pages/Settings')),
  }
];

const routes = { comman };

export default routes;