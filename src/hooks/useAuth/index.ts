import { RootLoaderData } from '@/routes/Root/loader';
import React from 'react';

export const AuthContext = React.createContext<RootLoaderData | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a RootProvider');
  }

  return context;
};
