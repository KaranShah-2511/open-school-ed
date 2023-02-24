import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
const comman: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/List')),
    index: true
  },
  {
    path: '/add',
    element: lazy(() => import('../Pages/AddEdit')),
  },
  {
    path: '/edit',
    to: '/global-message'
  },
  {
    path: '/edit/:id',
    element: lazy(() => import('../Pages/AddEdit')),
  },
];

const routes = { comman };

export default routes;