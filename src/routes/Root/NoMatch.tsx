import { Title } from '@/components';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdHome } from 'react-icons/md';

const NoMatch = () => {
  const { t } = useTranslation();
  const title = t('no-match.title');
  return (
    <main role="main" id="jod-main" className="m-4 flex flex-col items-center justify-center gap-4">
      <Title value={title} />
      <h1 className="text-heading-1">{title}</h1>
      <p className="text-body-lg">{t('no-match.description')}</p>
      <Button
        icon={<MdHome size={24} />}
        iconSide="left"
        label={t('return-home')}
        size="md"
        variant="gray"
        /* eslint-disable-next-line react/no-unstable-nested-components */
        LinkComponent={({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>}
      />
    </main>
  );
};

export default NoMatch;
