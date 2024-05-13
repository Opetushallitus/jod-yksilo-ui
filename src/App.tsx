import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import Root, { loader } from '@/routes/Root';
import NoInternetAccess from '@/routes/NoInternetAccess';
import { lng } from './i18n/config';

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect(`/${lng}`),
  },
  {
    path: '/:lng/*',
    loader,
    element: <Root />,
    errorElement: <NoInternetAccess />,
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
