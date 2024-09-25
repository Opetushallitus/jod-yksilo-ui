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
      <span className="text-body-sm font-arial text-secondary-gray sm:text-body-xs">
        <div>{t('profile.help-text')}</div>
      </span>
      <ul className="flex flex-col gap-4">
        <li>
          <div className="flex gap-x-3">
            <MdOutlineSchool size={24} color="00818A" />
            <div>{t('profile.education-history')}</div>
          </div>
        </li>
        <li>
          <div className="flex gap-x-3">
            <TbBriefcase2 size={24} color="AD4298" />
            <div>{t('profile.work-history')}</div>
          </div>
        </li>
        <li>
          <div className="flex gap-x-3">
            <MdOutlineSailing size={24} color="006DB3" />
            <div>{t('profile.free-time-activities')}</div>
          </div>
        </li>
      </ul>
    </>
  );
};

const Competences = () => {
  const { t } = useTranslation();
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

          <div className="pb-7">
            <p className="mb-6 text-body-md font-arial text-black">{t('tool.competences.page-description')}</p>
            <p className="text-body-md font-arial text-black">{t('tool.competences.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-1 sm:order-2 sm:col-span-2">
          <div className="mb-5">
            <InputField
              label={t('tool.competences.input-field-placeholder')}
              value={taito}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTaito(event.target.value)}
            />
          </div>
          <OsaamisSuosittelija description={debouncedTaito} onChange={setOsaamiset} value={osaamiset} />
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

export default Competences;
