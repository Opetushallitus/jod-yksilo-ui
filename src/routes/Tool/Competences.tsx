import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
import { Accordion, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineSailing, MdOutlineSchool } from 'react-icons/md';
import { TbBriefcase2 } from 'react-icons/tb';
import { useOutletContext } from 'react-router-dom';
import { ContextType } from './types';

const HelpingToolsContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <span className="text-body-sm sm:text-body-xs">
        <div>{t('profile.help-text')}</div>
      </span>
      <ul className="flex flex-col gap-4 text-button-md">
        <li>
          <div className="flex gap-x-3">
            <MdOutlineSchool size={24} color="#00818A" />
            <div>{t('profile.education-history.title')}</div>
          </div>
        </li>
        <li>
          <div className="flex gap-x-3">
            <TbBriefcase2 size={24} color="#AD4298" />
            <div>{t('profile.work-history.title')}</div>
          </div>
        </li>
        <li>
          <div className="flex gap-x-3">
            <MdOutlineSailing size={24} className="text-accent" />
            <div>{t('profile.free-time-activities.title')}</div>
          </div>
        </li>
      </ul>
    </>
  );
};

const Competences = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const [debouncedTaito, taito, setTaito] = useDebounceState('', 500);
  const {
    competences: [osaamiset, setOsaamiset],
  } = useOutletContext<ContextType>();

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        <div className="order-1 col-span-1 sm:col-span-2">
          <h1 className="mb-5 mt-7 text-heading-1 text-black">{t('tool.competences.heading-1')}</h1>

          <div className="flex flex-col pb-7 gap-6 text-body-md text-black">
            <p>{t('tool.competences.page-description')}</p>
            <p>{t('tool.competences.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-1 sm:order-2 sm:col-span-2">
          <div className="mb-5">
            <InputField
              label={t('tool.competences.input-field-placeholder')}
              placeholder={t('tool.competences.input-field-placeholder')}
              value={taito}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTaito(event.target.value)}
            />
          </div>
          <OsaamisSuosittelija description={debouncedTaito} onChange={setOsaamiset} value={osaamiset} />
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

export default Competences;
