import { components } from '@/api/schema';
import React from 'react';

export const AuthContext = React.createContext<components['schemas']['YksiloDto'] | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a RootProvider');
  }

  return context;
};
