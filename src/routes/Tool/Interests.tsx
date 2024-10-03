import { components } from '@/api/schema';
import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { Accordion, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineInterests, MdOutlineQuiz } from 'react-icons/md';
import { useOutletContext, useRouteLoaderData } from 'react-router-dom';
import { generateProfileLink } from '../Profile/utils';
import { ContextType } from './types';

const HelpingToolsContent = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const interestsLink = React.useMemo(
    () => generateProfileLink('slugs.profile.interests', data, language, t),
    [data, language, t],
  );

  return (
    <>
      <span className="text-body-sm sm:text-body-xs">
        <div>{t('tool.interests.help-text')}</div>
      </span>
      <ul className="flex flex-col gap-4 text-button-md">
        <li>
          <interestsLink.component to={interestsLink.to}>
            <div className="flex gap-x-3">
              <MdOutlineInterests size={24} color="#006DB3" />
              <div>{t('profile.interests.title')}</div>
            </div>
          </interestsLink.component>
        </li>
        <li>
          <div className="flex gap-x-3">
            <MdOutlineQuiz size={24} color="#006DB3" />
            <div>{t('tool.interests.riasec-test')}</div>
          </div>
        </li>
        <li>
          <div className="flex gap-x-3">
            <MdOutlineInterests size={24} color="#AD4298" />
            <div>{t('tool.interests.interest-barometer')}</div>
          </div>
        </li>
      </ul>
    </>
  );
};

const Interests = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const [debouncedKiinnostus, kiinnostus, setKiinnostus] = useDebounceState('', 500);
  const {
    interests: [kiinnostukset, setKiinnostukset],
  } = useOutletContext<ContextType>();

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        <div className="order-1 col-span-1 sm:col-span-2">
          <h1 className="mb-5 mt-7 text-heading-1 text-black">{t('tool.interests.heading-1')}</h1>

          <div className="flex flex-col pb-7 gap-6 text-body-md text-black">
            <p>{t('tool.interests.page-description')}</p>
            <p>{t('tool.interests.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-1 sm:order-2 sm:col-span-2">
          <div className="mb-5">
            <InputField
              label={t('tool.interests.input-field-placeholder')}
              placeholder={t('tool.interests.input-field-placeholder')}
              value={kiinnostus}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKiinnostus(event.target.value)}
            />
          </div>
          <OsaamisSuosittelija
            description={debouncedKiinnostus}
            onChange={setKiinnostukset}
            value={kiinnostukset}
            sourceType="KIINNOSTUS"
          />
        </div>
        <div className="order-2 col-span-1 mb-8 flex flex-col gap-4 sm:order-3 sm:mb-0 bg-todo">
          {sm ? (
            <>
              <span className="text-heading-4 text-black">{t('tools')}</span>
              <HelpingToolsContent />
            </>
          ) : (
            <Accordion
              title={t('tools')}
              expandLessText={t('expand-less')}
              expandMoreText={t('expand-more')}
              lang={language}
            >
              <HelpingToolsContent />
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interests;
