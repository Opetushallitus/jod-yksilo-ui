import { Button } from '@jod/design-system';
import { JodHome } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

const NoMatch = () => {
  const { t } = useTranslation();
  const title = t('no-match.title');
  return (
    <main role="main" id="jod-main" className="m-4 flex flex-col items-center justify-center gap-4">
      <title>{title}</title>
      <h1 className="text-heading-1">{title}</h1>
      <p className="text-body-lg">{t('no-match.description')}</p>
      <Button
        icon={<JodHome />}
        iconSide="left"
        label={t('return-home')}
        variant="accent"
        /* eslint-disable-next-line react/no-unstable-nested-components */
        LinkComponent={({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>}
      />
    </main>
  );
};

export default NoMatch;
