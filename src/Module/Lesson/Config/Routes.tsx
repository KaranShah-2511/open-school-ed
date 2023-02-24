import type { RouteProps } from '../../../Core/Components/Routes';
import { lazy } from 'react';

/* Route */
const comman: RouteProps[] = [
  {
    path: '/material',
    element: lazy(() => import('../Pages/Material'))
  },
  {
    path: '/homework/material',
    element: lazy(() => import('../Pages/Material/HomeWorkMaterial'))
  }
];

/** Teacher Route */
const teacher: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Teacher/List')),
    index: true
  },
  {
    path: '/detail',
    to: '/lesson'
  },
  {
    path: '/detail/:id',
    element: lazy(() => import('../Pages/Teacher/Detail')),
  },
  {
    path: '/add',
    element: lazy(() => import('../Pages/Teacher/AddEdit'))
  },
  {
    path: '/edit',
    to: '/lesson/add'
  },
  {
    path: '/edit/:id',
    element: lazy(() => import('../Pages/Teacher/AddEdit'))
  },
  {
    path: '/home-work-submitted-detail',
    to: '/'
  },
  {
    path: '/home-work-submitted-detail/:lessonID/:pupilID',
    element: lazy(() => import('../Pages/Teacher/Homework/Detail'))
  },

];

/** School Route */
const school: RouteProps[] = teacher;

/** Pupil Route */
const pupil: RouteProps[] = [
  {
    path: '',
    element: lazy(() => import('../Pages/Pupil/List')),
    index: true
  },
  {
    path: '/detail',
    to: '/lesson'
  },
  {
    path: '/detail/:id',
    element: lazy(() => import('../Pages/Pupil/Detail')),
  },
  {
    path: '/homework-detail',
    to: '/lesson'
  },
  {
    path: '/homework-detail/:lid',
    element: lazy(() => import('../Pages/Pupil/Homework/Detail')),
  },
  {
    path: '/homework-submitted-marked',
    to: '/lesson'
  },
  {
    path: '/homework-submitted-marked/:lid',
    element: lazy(() => import('../Pages/Pupil/Homework/SubmittedMarked')),
  },
  {
    path: '/open-workspace',
    element: lazy(() => import('../Pages/Pupil/OpenWorkspace')),
  },
];

const routes = { school, teacher, pupil, comman };

export default routes;