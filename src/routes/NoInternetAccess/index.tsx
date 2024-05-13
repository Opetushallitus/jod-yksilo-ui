import { useTranslation } from 'react-i18next';

const NoInternetAccess = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">{t('no-internet-access.title')}</h1>
      <p className="text-lg">{t('no-internet-access.content')}</p>
    </div>
  );
};

export default NoInternetAccess;
