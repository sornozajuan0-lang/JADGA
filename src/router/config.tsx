import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Home = lazy(() => import('../pages/home/page'));
const ChatEducativo = lazy(() => import('../pages/chat-educativo/page'));
const Juegos = lazy(() => import('../pages/juegos/page'));
const GuiaPadres = lazy(() => import('../pages/guia-padres/page'));
const Progreso = lazy(() => import('../pages/progreso/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat-educativo',
    element: <ChatEducativo />,
  },
  {
    path: '/juegos',
    element: <Juegos />,
  },
  {
    path: '/guia-padres',
    element: <GuiaPadres />,
  },
  {
    path: '/progreso',
    element: <Progreso />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;