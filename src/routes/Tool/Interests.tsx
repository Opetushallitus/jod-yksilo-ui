import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { Accordion, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineInterests, MdOutlineQuiz } from 'react-icons/md';
import { useOutletContext } from 'react-router-dom';
import { ContextType } from './types';

const HelpingToolsContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <span className="text-body-sm font-arial text-secondary-gray sm:text-body-xs">
        <div>{t('tool.interests.help-text')}</div>
      </span>
      <ul className="flex flex-col gap-4">
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
  const { t } = useTranslation();
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

          <div className="pb-7">
            <p className="mb-6 text-body-md font-arial text-black">{t('tool.interests.page-description')}</p>
            <p className="text-body-md font-arial text-black">{t('tool.interests.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-1 sm:order-2 sm:col-span-2">
          <div className="mb-5">
            <InputField
              label={t('tool.interests.input-field-placeholder')}
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
        <div className="order-2 col-span-1 mb-8 flex flex-col gap-4 sm:order-3 sm:mb-0">
          {sm ? (
            <>
              <span className="text-heading-4 text-black">Apuvälineitä</span>
              <HelpingToolsContent />
            </>
          ) : (
            <Accordion title="Apuvälineitä" expandLessText="Less" expandMoreText="More" lang="xy">
              <HelpingToolsContent />
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interests;
