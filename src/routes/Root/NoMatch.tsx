import { Title } from '@/components';
import { useTranslation } from 'react-i18next';

const NoMatch = () => {
  const { t } = useTranslation();
  const title = t('no-match.title');
  return (
    <main role="main" id="jod-main" className="mx-auto w-full max-w-[1140px] grow px-5 pb-6 pt-8 sm:px-6 print:p-0">
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">{t('no-match.description')}</p>
    </main>
  );
};

export default NoMatch;
