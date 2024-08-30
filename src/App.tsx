import { RouterProvider } from 'react-router-dom';
import useLocalizedRoutes from './hooks/useLocalizedRoutes/useLocalizedRoutes';
import './index.css';

const App = () => {
  const { router } = useLocalizedRoutes();
  return <RouterProvider router={router} />;
};

export default App;
