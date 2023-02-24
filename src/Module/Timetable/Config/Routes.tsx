import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
/** Teacher Route */
const teacher: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Teacher')),
    index: true
  },
  {
    path: ':type',
    element: lazy(() => import('../Pages/Teacher'))
  }
];
/** Pupil Route */
const pupil: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Pupil')),
    index: true
  },
  {
    path: ':type',
    element: lazy(() => import('../Pages/Pupil'))
  }
];
const routes = { teacher, pupil };

export default routes;