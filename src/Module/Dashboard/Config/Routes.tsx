import { lazy } from 'react';
import type { RouteProps } from '../../../Core/Components/Routes';

/* Route */
/** School Route */
const school: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/School')),
    index: true
  }
];
/** Teacher Route */
const teacher: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Teacher')),
    index: true
  }
];
/** Pupil Route */
const pupil: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Pupil')),
    index: true
  }
];
const routes = { school, teacher, pupil };

export default routes;
