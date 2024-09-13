import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Tutkinto, getEducationHistoryTableRows } from '../utils';
import { type EducationHistoryForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<EducationHistoryForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const koulutus = watch();
    setRows(
      getEducationHistoryTableRows([
        {
          kategoria: koulutus.nimi
            ? {
                nimi: { fi: koulutus.nimi },
              }
            : undefined,
          koulutukset: koulutus.koulutukset.map(
            (tutkinto) =>
              ({
                nimi: {
                  fi: tutkinto.nimi,
                },
                alkuPvm: tutkinto.alkuPvm,
                loppuPvm: tutkinto.loppuPvm,
                osaamiset: tutkinto.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Tutkinto,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('work-history.summary')}</h2>
      <p className="mb-7 text-body-sm font-arial text-black sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <ExperienceTable mainColumnHeader={t('education-history.degree-or-course')} rows={rows} />
    </>
  );
};

export default SummaryStep;
