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
    path: ':tab',
    element: lazy(() => import('../Pages/List')),
  },
  {
    path: '/detail',
    to: '/pupil-management'
  },
  {
    path: '/detail/:id',
    element: lazy(() => import('../Pages/Detail')),
  },
  {
    path: '/add',
    element: lazy(() => import('../Pages/AddEdit')),
  },
  {
    path: '/edit',
    to: '/pupil-management'
  },
  {
    path: '/edit/:id',
    element: lazy(() => import('../Pages/AddEdit')),
  },
];

const routes = { comman };

export default routes;