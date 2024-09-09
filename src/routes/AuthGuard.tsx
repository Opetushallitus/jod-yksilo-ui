import { authProvider } from '@/providers';
import React from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return authProvider.loginState === 'loggedIn' ? children : <div className="flex grow"></div>;
};
