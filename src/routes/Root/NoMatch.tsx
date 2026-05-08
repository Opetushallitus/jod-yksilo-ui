import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Button } from '@jod/design-system';
import { JodError } from '@jod/design-system/icons';

import { IconHeading } from '@/components/IconHeading';

const NoMatch = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const title = t('common:no-match.title');

  return (
    <>
      <title>{title}</title>
      <main id="jod-main" role="main" className="mx-auto w-full max-w-(--breakpoint-xl)" data-testid="no-match">
        <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pt-[88px] pb-[96px] sm:px-6">
          <div className="col-span-3 flex flex-col lg:col-span-2">
            <IconHeading icon={<JodError />} title={title} />
            <p className="mb-11 text-body-lg">{t('common:no-match.description')}</p>
            <Button
              label={t('common:no-match.go-home')}
              serviceVariant="yksilo"
              variant="accent"
              linkComponent={({ children, className }) => (
                <Link to={`/${language}`} className={className}>
                  {children}
                </Link>
              )}
              className="w-fit"
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default NoMatch;
