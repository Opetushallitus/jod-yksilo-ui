import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { csrf } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!csrf) {
      navigate(`/${i18n.language}`);
    }
  }, [csrf, i18n.language, navigate]);

  return csrf ? children : <></>;
};
