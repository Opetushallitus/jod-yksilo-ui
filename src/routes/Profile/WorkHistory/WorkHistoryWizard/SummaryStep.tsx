import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Toimenkuva, getWorkHistoryTableRows } from '../utils';
import { type WorkHistoryForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<WorkHistoryForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const tyopaikka = watch();
    setRows(
      getWorkHistoryTableRows([
        {
          nimi: tyopaikka.nimi,
          toimenkuvat: tyopaikka.toimenkuvat.map(
            (toimenkuva) =>
              ({
                nimi: toimenkuva.nimi,
                alkuPvm: toimenkuva.alkuPvm,
                loppuPvm: toimenkuva.loppuPvm,
                osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Toimenkuva,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <h2 className="mb-4 text-black text-hero-mobile sm:text-hero">{t('work-history.summary')}</h2>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.summary-description')}
      </p>
      <div data-testid="work-history-summary-table">
        <ExperienceTable mainColumnHeader={t('work-history.workplace-or-job-description')} rows={rows} />
      </div>
    </>
  );
};

export default SummaryStep;
