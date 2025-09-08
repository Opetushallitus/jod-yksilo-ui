import { Accordion } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';

const AboutAi = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('about-ai-page.title');

  const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
      <g clipPath="url(#clip0_15716_148709)">
        <path
          d="M12.5977 2.34766C7.07766 2.34766 2.59766 6.82766 2.59766 12.3477C2.59766 17.8677 7.07766 22.3477 12.5977 22.3477C18.1177 22.3477 22.5977 17.8677 22.5977 12.3477C22.5977 6.82766 18.1177 2.34766 12.5977 2.34766ZM12.5977 15.6077L10.9677 20.0177L9.33766 15.6077L4.92766 13.9777L9.33766 12.3477L10.9677 7.93766L12.5977 12.3477L17.0077 13.9777L12.5977 15.6077ZM17.1277 9.73766L16.1677 12.3477L15.2077 9.73766L12.5977 8.77766L15.2077 7.81766L16.1677 5.20766L17.1277 7.81766L19.7377 8.77766L17.1277 9.73766Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_15716_148709">
          <rect width="24" height="24" fill="white" transform="translate(0.597656 0.347656)" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <>
      <title>{title}</title>

      <div className="mb-6 sm:mb-8 flex gap-x-4 items-center">
        <span className="flex items-center justify-center size-9 aspect-square rounded-full bg-secondary-1-dark-2">
          <AiIcon />
        </span>
        <h1
          data-testid="about-ai-title"
          className="text-hero-mobile sm:text-hero text-secondary-1-dark-2 hyphens-auto text-pretty break-all"
        >
          {title}
        </h1>
      </div>
      <div className="font-arial">
        <div>
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.why-ai.title')}
          </h2>
          <p className="mb-6 text-body-lg-mobile sm:text-body-lg">{t('about-ai-page.why-ai.description')}</p>
          <p className="mb-5 text-body-md-mobile sm:text-body-md">{t('about-ai-page.why-ai.possibilities.title')}</p>

          <div className="mb-8">
            <Accordion
              lang={language}
              titleText={t('about-ai-page.why-ai.possibilities.item-1.title')}
              title={
                <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                  {t('about-ai-page.why-ai.possibilities.item-1.title')}
                </span>
              }
            >
              <Trans i18nKey="about-ai-page.why-ai.possibilities.item-1.description" />
            </Accordion>

            <Accordion
              lang={language}
              titleText={t('about-ai-page.why-ai.possibilities.item-2.title')}
              title={
                <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                  {t('about-ai-page.why-ai.possibilities.item-2.title')}
                </span>
              }
            >
              <p className="mb-3 font-poppins text-heading-5">
                <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.work.title" />
              </p>
              <p>{t('about-ai-page.why-ai.possibilities.item-2.work.description-1')}</p>
              <ul className="ml-6 mb-4 list-disc">
                <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-1')}</li>
                <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-2')}</li>
                <li>{t('about-ai-page.why-ai.possibilities.item-2.work.list.item-3')}</li>
              </ul>
              <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.work.description-2" />

              <p className="mt-4 mb-3 font-poppins text-heading-5">
                <Trans i18nKey="about-ai-page.why-ai.possibilities.item-2.education.title" />
              </p>
              <p>{t('about-ai-page.why-ai.possibilities.item-2.education.description-1')}</p>
              <ul className="ml-6 mb-3 list-disc">
                <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-1')}</li>
                <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-2')}</li>
                <li>{t('about-ai-page.why-ai.possibilities.item-2.education.list.item-3')}</li>
              </ul>
              <p>{t('about-ai-page.why-ai.possibilities.item-2.education.description-2')}</p>
            </Accordion>

            <Accordion
              lang={language}
              titleText={t('about-ai-page.why-ai.possibilities.item-3.title')}
              title={
                <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                  {t('about-ai-page.why-ai.possibilities.item-3.title')}
                </span>
              }
            >
              {t('about-ai-page.why-ai.possibilities.item-3.description')}
            </Accordion>

            <Accordion
              lang={language}
              titleText={t('about-ai-page.why-ai.possibilities.item-4.title')}
              title={
                <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                  {t('about-ai-page.why-ai.possibilities.item-4.title')}
                </span>
              }
            >
              {t('about-ai-page.why-ai.possibilities.item-4.description')}
            </Accordion>

            <Accordion
              lang={language}
              titleText={t('about-ai-page.why-ai.possibilities.item-5.title')}
              title={
                <span className="font-poppins text-heading-4-mobile sm:text-heading-4">
                  {t('about-ai-page.why-ai.possibilities.item-5.title')}
                </span>
              }
            >
              <Trans i18nKey="about-ai-page.why-ai.possibilities.item-5.description" />
            </Accordion>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.ai-methods.title')}
          </h2>
          <p className="">{t('about-ai-page.ai-methods.description-1')}</p>
          <ul className="mt-3 ml-6 mb-3 list-disc">
            <li>{t('about-ai-page.ai-methods.list.item-1')}</li>
            <li>{t('about-ai-page.ai-methods.list.item-2')}</li>
            <li>{t('about-ai-page.ai-methods.list.item-3')}</li>
            <li>{t('about-ai-page.ai-methods.list.item-4')}</li>
            <li>{t('about-ai-page.ai-methods.list.item-5')}</li>
          </ul>
          <p className="">{t('about-ai-page.ai-methods.description-2')}</p>
          <div className="rounded flex flex-row bg-bg-gray-2 p-4 gap-4 text-heading-4-mobile sm:text-heading-4 text-primary-gray my-8 font-poppins">
            <JodInfo className="text-secondary-1-dark-2" />
            <div className="flex-1 flex flex-col">
              <div className="flex gap-2">
                <span>{t('about-ai-page.ai-methods.data-location')}</span>
                <span className="text-secondary-1-dark-2">{t('about-ai-page.ai-methods.data-location-eu')}</span>
              </div>
              <div className="flex gap-2">
                <span>{t('about-ai-page.ai-methods.data-preservation-time')}</span>
                <span className="text-[#004e82]">
                  {t('about-ai-page.ai-methods.data-preservation-time-until-delete')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.security.title')}
          </h2>
          <p className="">
            <Trans i18nKey={'about-ai-page.security.description-1'} />
          </p>
          <ul className="ml-6 mb-4 list-disc">
            <li>{t('about-ai-page.security.list.item-1')}</li>
            <li>{t('about-ai-page.security.list.item-2')}</li>
            <li>{t('about-ai-page.security.list.item-3')}</li>
            <li>{t('about-ai-page.security.list.item-4')}</li>
          </ul>
          <Trans i18nKey={'about-ai-page.security.description-2'} />
        </div>

        <div>
          <h2 className="mt-8 mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.effect.title')}
          </h2>
          <p className="">{t('about-ai-page.effect.description')}</p>
          <ul className="ml-6 mb-3 list-disc">
            <li>{t('about-ai-page.effect.list.item-1')}</li>
            <li>{t('about-ai-page.effect.list.item-2')}</li>
            <li>{t('about-ai-page.effect.list.item-3')}</li>
            <li>{t('about-ai-page.effect.list.item-4')}</li>
          </ul>
        </div>

        <div>
          <h2 className="mt-8 mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.functionality-tracking.title')}
          </h2>
          <p className="">{t('about-ai-page.functionality-tracking.description-1')}</p>
          <ul className="ml-6 mb-4 list-disc">
            <li>{t('about-ai-page.functionality-tracking.list.item-1')}</li>
            <li>{t('about-ai-page.functionality-tracking.list.item-2')}</li>
            <li>{t('about-ai-page.functionality-tracking.list.item-3')}</li>
            <li>{t('about-ai-page.functionality-tracking.list.item-4')}</li>
          </ul>
          <p className="">{t('about-ai-page.functionality-tracking.description-2')}</p>
        </div>

        <div className="mt-8">
          <hr aria-hidden className="my-4 h-1 bg-bg-gray-2 border-0" />
          <h2 className="mt-7 mb-3 text-heading-2-mobile sm:text-heading-2 font-poppins">
            {t('about-ai-page.limitation-of-liability.title')}
          </h2>
          <p>
            <Trans i18nKey={'about-ai-page.limitation-of-liability.description'} />
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutAi;
