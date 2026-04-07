import { LogoRgbFi, Tooltip, TooltipContent, TooltipTrigger, useMediaQueries } from '@jod/design-system';
import { JodInfo, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AnchorLink } from '../AnchorLink/AnchorLink';
import {
  LogoOpintopolkuEn,
  LogoOpintopolkuFi,
  LogoOpintopolkuSv,
  LogoTyomarkkinatoriEn,
  LogoTyomarkkinatoriFi,
  LogoTyomarkkinatoriSv,
} from '../Logos';

const BlueArrows = () => {
  const { sm } = useMediaQueries();
  return sm ? (
    <svg width="396" height="71" viewBox="0 0 396 71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_24362_51224)">
        <path d="M210.785 99.3945C210.785 52.8945 174.285 68.3945 192.851 26.3945" stroke="#85C4EC" strokeWidth="15" />
        <path d="M205.111 33.1498L180.113 26.0732L198.741 7.9613L205.111 33.1498Z" stroke="#85C4EC" strokeWidth="8" />
        <path d="M5.00021 94C-1.49987 27.5 133.76 64 150.761 25.5" stroke="#ADD8F2" strokeWidth="15" />
        <path d="M162.422 32.9552L138.933 21.8523L160.293 7.06097L162.422 32.9552Z" stroke="#ADD8F2" strokeWidth="8" />
        <path d="M391.508 92C391.508 14 256.762 67.5 239.762 29" stroke="#ADD8F2" strokeWidth="15" />
        <path d="M226.344 32.9552L249.832 21.8523L228.472 7.06097L226.344 32.9552Z" stroke="#ADD8F2" strokeWidth="8" />
      </g>
      <defs>
        <clipPath id="clip0_24362_51224">
          <rect width="396" height="71" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg width="274" height="72" viewBox="0 0 274 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150.285 99.5664C150.285 53.0664 113.785 68.5664 132.351 26.5664" stroke="#85C4EC" strokeWidth="15" />
      <path d="M144.607 33.3217L119.609 26.2451L138.237 8.13317L144.607 33.3217Z" stroke="#85C4EC" strokeWidth="8" />
      <path d="M7.5 83.1719C7.5 32.6719 77 57.6719 90.2605 25.6719" stroke="#ADD8F2" strokeWidth="15" />
      <path d="M101.922 33.1271L78.4333 22.0242L99.7935 7.23284L101.922 33.1271Z" stroke="#ADD8F2" strokeWidth="8" />
      <path d="M267 79.6719C250.5 41.6719 196.261 67.6719 179.261 29.1719" stroke="#ADD8F2" strokeWidth="15" />
      <path d="M165.844 33.1271L189.332 22.0242L167.972 7.23284L165.844 33.1271Z" stroke="#ADD8F2" strokeWidth="8" />
    </svg>
  );
};

const GrayArrows = () => {
  const { sm } = useMediaQueries();
  return sm ? (
    <svg width="214" height="70" viewBox="0 0 214 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_24368_26783)">
        <path d="M5.49913 91C1.49921 27 87.1589 75.5 87.1592 22" stroke="#CCCCCC" strokeWidth="15" />
        <path
          d="M99.6001 32.6306L74.7373 25.0923L93.6974 7.32843L99.6001 32.6306Z"
          fill="white"
          stroke="#CCCCCC"
          strokeWidth="8"
        />
        <path d="M206.686 91.5C218.186 26.5 135.186 73 128.686 30" stroke="#CCCCCC" strokeWidth="15" />
        <path
          d="M116.052 32.0504L141.457 26.6137L124.048 7.33093L116.052 32.0504Z"
          fill="white"
          stroke="#CCCCCC"
          strokeWidth="8"
        />
      </g>
      <defs>
        <clipPath id="clip0_24368_26783">
          <rect width="214" height="70" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg width="203" height="70" viewBox="0 0 203 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.66069 91.3281C3.66078 27.3281 75.6605 75.8281 75.6608 22.3281" stroke="#CCCCCC" strokeWidth="15" />
      <path
        d="M88.1001 32.9587L63.2373 25.4204L82.1974 7.65655L88.1001 32.9587Z"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="8"
      />
      <path d="M194.303 92.1328C205.803 27.1328 122.803 73.6328 116.303 30.6328" stroke="#CCCCCC" strokeWidth="15" />
      <path
        d="M103.669 32.6832L129.074 27.2465L111.665 7.96375L103.669 32.6832Z"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="8"
      />
    </svg>
  );
};

const getLocalizedLogos = (language: string) => {
  switch (language) {
    case 'sv':
      return {
        opintopolkuLogo: <LogoOpintopolkuSv width="100%" className="h-7" />,
        tyomarkkinatoriLogo: <LogoTyomarkkinatoriSv width="100%" className="h-7" />,
      };
    case 'en':
      return {
        opintopolkuLogo: <LogoOpintopolkuEn width="100%" className="h-7" />,
        tyomarkkinatoriLogo: <LogoTyomarkkinatoriEn width="100%" className="h-7" />,
      };
    default:
      return {
        opintopolkuLogo: <LogoOpintopolkuFi width="100%" className="h-7" />,
        tyomarkkinatoriLogo: <LogoTyomarkkinatoriFi width="100%" className="h-7" />,
      };
  }
};

export function HowToUse() {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const findOpportunitiesId = React.useId();
  const findOpportunitiesWithoutLoginId = React.useId();
  const createProfileId = React.useId();
  const findWithWordsId = React.useId();
  const { opintopolkuLogo, tyomarkkinatoriLogo } = getLocalizedLogos(language);
  const tooltipPortalRef = React.useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (tooltipPortalRef.current) {
      setPortalRoot(tooltipPortalRef.current);
    }
  }, []);

  return (
    <figure className="flex flex-col justify-center items-center">
      <div className="bg-white rounded-2xl border-4 border-secondary-1-light-3 px-4 py-2 pb-4 max-w-lg">
        <div className="flex flex-col flex-1">
          <div className="mb-3 flex gap-3 items-end">
            <LogoRgbFi size="26" />
            <div className="text-primary-gray sm:text-body-sm text-body-xs font-semibold sm:mb-0 mb-1">
              / {t('common:navigation.external.yksilo.label')}
            </div>
          </div>
          <div
            className="bg-secondary-1-dark rounded-md p-5 text-white text-body-sm font-semibold flex items-center justify-center"
            ref={tooltipPortalRef}
          >
            <span className="mr-3">{t('how-to-use.find-opportunities-title')}</span>
            <Tooltip>
              <TooltipTrigger aria-label={t('common:more-info')} aria-describedby={findOpportunitiesId}>
                <JodInfo />
              </TooltipTrigger>
              <TooltipContent id={findOpportunitiesId} portalRoot={portalRoot}>
                <p className="font-bold mb-2">{t('how-to-use.find-opportunities-title')}</p>
                <p className="mb-3">{t('how-to-use.find-opportunities-description')}</p>
                <p className="mb-2">{t('how-to-use.find-opportunities-disclaimer')}</p>
                <p>
                  <Trans
                    i18nKey="how-to-use.find-opportunities-more-info"
                    components={{
                      Icon: <JodOpenInNew size={18} ariaLabel={t('common:external-link')} />,
                      CustomLink: (
                        <AnchorLink
                          href={`/${language}/${t('common:slugs.ai-usage')}`}
                          className="inline-flex underline"
                          target="_blank"
                        />
                      ),
                    }}
                  />
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col items-center">
            <BlueArrows />
            <div className="flex flex-row gap-3 flex-1 text-primary-gray text-body-xs font-semibold sm:text-[12px] text-[10px] sm:text-left text-center">
              <div className="flex sm:flex-row flex-col justify-between items-center gap-2 flex-1 bg-secondary-1-light-2 p-4 rounded-md">
                {t('how-to-use.find-opportunities-without-login-title')}
                <Tooltip>
                  <TooltipTrigger aria-label={t('common:more-info')} aria-describedby={findOpportunitiesWithoutLoginId}>
                    <JodInfo size={20} />
                  </TooltipTrigger>
                  <TooltipContent id={findOpportunitiesWithoutLoginId}>
                    <p className="font-bold mb-2">{t('how-to-use.find-opportunities-without-login-title')}</p>
                    <p>{t('how-to-use.find-opportunities-without-login-description')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex sm:flex-row flex-col justify-between items-center gap-2 flex-1 bg-secondary-1-light-1 p-4 rounded-md">
                {t('how-to-use.create-profile-title')}
                <Tooltip>
                  <TooltipTrigger aria-label={t('common:more-info')} aria-describedby={createProfileId}>
                    <JodInfo size={20} />
                  </TooltipTrigger>
                  <TooltipContent id={createProfileId}>
                    <p className="font-bold mb-2">{t('how-to-use.create-profile-title')}</p>
                    <p>{t('how-to-use.create-profile-description')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex sm:flex-row flex-col justify-between items-center gap-2 flex-1 bg-secondary-1-light-2 p-4 rounded-md">
                {t('how-to-use.find-with-words-title')}
                <Tooltip>
                  <TooltipTrigger aria-label={t('common:more-info')} aria-describedby={findWithWordsId}>
                    <JodInfo size={20} />
                  </TooltipTrigger>
                  <TooltipContent id={findWithWordsId}>
                    <p className="font-bold mb-2">{t('how-to-use.find-with-words-title')}</p>
                    <p>{t('how-to-use.find-with-words-description')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center -top-5 relative">
        <GrayArrows />
        <div className="flex flex-row gap-3 text-primary-gray text-body-xs sm:text-[12px] text-[10px] font-semibold text-center">
          <div className="flex flex-col justify-center items-center gap-3 flex-1 sm:w-[150px] w-[120px] bg-primary-light-2 p-5 rounded-md">
            {t('how-to-use.job-seeker-profile')}
            <div className="flex items-center">{tyomarkkinatoriLogo}</div>
          </div>
          <div className="flex flex-col justify-center items-center gap-3 flex-1 sm:w-[150px] w-[120px] bg-primary-light-2 p-5 rounded-md">
            {t('how-to-use.education-history')}
            <div className="flex items-center">{opintopolkuLogo}</div>
          </div>
        </div>
      </div>
    </figure>
  );
}
