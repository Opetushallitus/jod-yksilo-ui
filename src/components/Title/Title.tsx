import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface TitleProps {
  value: string;
}

export const Title = ({ value }: TitleProps) => {
  const { t } = useTranslation();

  return (
    <Helmet>
      <title>{`${value} - ${t('osaamispolku')}`}</title>
    </Helmet>
  );
};
