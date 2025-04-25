import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Koulutus, getEducationHistoryTableRows } from '../utils';
import { type EducationHistoryForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<EducationHistoryForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const koulutuskokonaisuus = watch();
    setRows(
      getEducationHistoryTableRows([
        {
          nimi: koulutuskokonaisuus.nimi,
          koulutukset: koulutuskokonaisuus.koulutukset.map(
            (koulutus) =>
              ({
                nimi: koulutus.nimi,
                alkuPvm: koulutus.alkuPvm,
                loppuPvm: koulutus.loppuPvm,
                osaamiset: koulutus.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Koulutus,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <h2 className="mb-4 text-black text-hero-mobile sm:text-hero">{t('education-history.summary')}</h2>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.education-history.modals.summary-description')}
      </p>
      <ExperienceTable mainColumnHeader={t('education-history.education-provider-or-education')} rows={rows} />
    </>
  );
};

export default SummaryStep;
