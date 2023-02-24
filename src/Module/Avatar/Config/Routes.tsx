import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
const comman: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/CreateAvatar')),
    index: true
  },
 
];

const routes = { comman };

export default routes;

