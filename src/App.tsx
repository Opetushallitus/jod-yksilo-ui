import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import Root, { loader as rootLoader } from './routes/Root';
import { lng } from './i18n/config';

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect(`/${lng}`),
  },
  {
    path: '/:lng/*',
    loader: rootLoader,
    element: <Root />,
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
