import { ErrorNoteProvider } from '@/providers';
import { RouterProvider } from 'react-router-dom';
import useLocalizedRoutes from './hooks/useLocalizedRoutes/useLocalizedRoutes';
import './index.css';

const App = () => {
  const { router } = useLocalizedRoutes();
  return (
    <ErrorNoteProvider>
      <RouterProvider router={router} />;
    </ErrorNoteProvider>
  );
};

export default App;
