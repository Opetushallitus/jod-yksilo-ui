import { OsaamisSuosittelija } from '@/components';
import { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useDebounceState } from '@/hooks/useDebounceState';
import { Accordion, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const HelpingToolsContent = () => (
  <>
    <span className="text-body-sm font-arial text-secondary-gray sm:text-body-xs">
      Rakenna koulutus- ja työhistoriasi käyttämällä alla olevia työkaluja, jolloin palvelu voi tunnistaa sinulle
      sopivia osaamisia.
    </span>
    <ul>
      <li>Koulutukseni</li>
      <li>Työpaikkani</li>
      <li>Vapaa-ajan toimintoni</li>
    </ul>
  </>
);

const Competences = () => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const [debouncedTaito, taito, setTaito] = useDebounceState('', 500);
  const [selectedCompetences, setSelectedCompentences] = React.useState<OsaaminenValue[]>([]);

  const osaamisSuosittelijaHandler = (values: OsaaminenValue[]) => {
    setSelectedCompentences(values);
  };

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
          <OsaamisSuosittelija
            description={debouncedTaito}
            onChange={osaamisSuosittelijaHandler}
            value={selectedCompetences}
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

export default Competences;
