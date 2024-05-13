import { RootLoaderData } from '@/routes/Root/loader';
import { createContext, useContext } from 'react';

export const AuthContext = createContext<RootLoaderData | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a RootProvider');
  }

  return context;
};
