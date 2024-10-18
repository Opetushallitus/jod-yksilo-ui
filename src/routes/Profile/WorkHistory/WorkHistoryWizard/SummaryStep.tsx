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
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('work-history.summary')}</h2>
      <ExperienceTable mainColumnHeader={t('work-history.workplace-or-job-description')} rows={rows} />
    </>
  );
};

export default SummaryStep;
