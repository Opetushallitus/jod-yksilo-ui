import { NavigationBar, SkipLink } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const ServiceBreak = () => {
  const title = 'Service break';
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <>
      <header role="banner" className="sticky top-0 z-30 print:hidden" data-testid="app-header">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          logo={{ to: '#jod-main', language, srText: t('osaamispolku') }}
          renderLink={Link}
          serviceBarVariant="palveluportaali"
          serviceBarTitle={t('my-competence-path')}
          translations={{
            showAllNotesLabel: t('show-all'),
            ariaLabelCloseNote: t('close'),
          }}
          testId="navigation-bar"
        />
      </header>
      <title>{title}</title>
      <main id="jod-main" role="main" className="mx-auto w-full max-w-(--breakpoint-xl)" data-testid="service-break">
        <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pt-[88px] pb-[96px] sm:px-6">
          <div className="col-span-3 flex flex-col lg:col-span-2 p-7">
            <div className="flex items-start">
              <div className="flex shrink  bg-secondary-gray rounded-full size-9 items-center justify-center mr-4">
                <JodInfo className="text-white" />
              </div>

              <h1 className="text-heading-1-mobile sm:text-heading-1 flex flex-col text-secondary-gray not-sm:gap-5">
                <span className="sm:text-hero text-hero-mobile">{'Huoltokatko käynnissä'}</span>
                <span className="text-[30px] sm:-mb-3">{'Underhåll pågår'}</span>
                <span className="text-[30px] ">{'Maintenance in progress'}</span>
              </h1>
            </div>

            <div className="flex flex-col gap-7 text-body-lg ml-11 mt-7">
              <p>
                {
                  'Suoritamme järjestelmän huoltotöitä parantaaksemme palvelua. Palvelu ei ole tällä hetkellä käytettävissä. Yritä myöhemmin uudelleen.'
                }
              </p>
              <p>
                {
                  'Vi utför underhållsarbete i systemet för att förbättra tjänsten. Tjänsten är för närvarande inte tillgänglig. Försök igen senare.'
                }
              </p>
              <p>
                {
                  'We are performing maintenance work to improve the service. The service is currently unavailable. Please try again later.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
