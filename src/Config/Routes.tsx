import { lazy } from 'react';
import type { RouteProps } from '../Core/Components/Routes';

/* Module */
import {
  Dashboard,
  Timetable,
  Lesson,
  PupilManagement,
  Parents,
  TeacherManagement,
  GlobelMessage,
  Settings,
  Avatar
} from '../Module';

/* Pages */
import NotFound from "../Pages/Error/NotFound";

/* Route */
const comman: RouteProps[] = [
  {
    path: '/404',
    element: NotFound,
  }
];

/* App Route */
const app: RouteProps[] = [
  {
    path: '/',
    to: 'dashboard',
    private: true
  },
  {
    path: '/user-type',
    element: lazy(() => import('../Pages/UserType')),
    isAuthTo: '/'
  },
  {
    path: '/introduction',
    to: '/user-type',
  },
  {
    path: '/introduction/:utype',
    element: lazy(() => import('../Pages/Introduction')),
    isAuthTo: '/'
  },
  {
    path: '/login',
    to: '/user-type',
    isAuthTo: '/'
  },
  {
    path: '/login/:utype',
    element: lazy(() => import('../Pages/Login')),
    isAuthTo: '/'
  },
  {
    path: '/pupil-registration',
    element: lazy(() => import('../Pages/PupilRegistration')),
    isAuthTo: '/'
  },
  {
    path: '/pupil-registration-confirmation',
    element: lazy(() => import('../Pages/PupilRegistration/Confirmation')),
    isAuthTo: '/'
  },
  {
    path: '/pupil-connection-code',
    to: '/pupil-registration',
    isAuthTo: '/'
  },
  {
    path: '/pupil-connection-code/:id',
    element: lazy(() => import('../Pages/PupilConnectionCode')),
  },
  /* Module Route */
  {
    path: '/dashboard/*',
    element: Dashboard,
    private: true
  },
  {
    path: '/timetable/*',
    element: Timetable,
    private: true
  },
  {
    path: '/pupil-management/*',
    element: PupilManagement,
    private: true
  },
  {
    path: '/settings/*',
    element: Settings,
    private: true
  },
  {
    path: '/parents/*',
    to: '/',
    private: true
  },

];

/** School Route */
const school: RouteProps[] = [
  {
    path: '/teacher-management/*',
    element: TeacherManagement,
    private: true
  },
  {
    path: '/global-message/*',
    element: GlobelMessage,
    private: true
  },
];

/** Teacher Route */
const teacher: RouteProps[] = [
  {
    path: '/global-message/*',
    element: GlobelMessage,
    private: true
  },
  {
    path: '/lesson/*',
    element: Lesson,
    private: true
  },
];

/** Pupil Route */
const pupil: RouteProps[] = [
  {
    path: '/avatar/*',
    element: Avatar,
    private: true
  },
  {
    path: '/lesson/*',
    element: Lesson,
    private: true
  },
];

/** Parent Route */
const parents: RouteProps[] = [
  {
    path: '/',
    to: 'parents',
    private: true
  },
  {
    path: '/zone',
    to: '/parents/zone',
    private: true
  },
  {
    path: '/login',
    to: '/parents/login',
    private: true
  },
  {
    path: '/parents/*',
    element: Parents,
    private: true
  }
];


const routes = { comman, app, school, teacher, pupil, parents };

export default routes;

