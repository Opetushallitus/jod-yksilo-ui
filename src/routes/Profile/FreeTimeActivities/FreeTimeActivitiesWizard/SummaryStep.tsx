import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Patevyys, getFreeTimeActivitiesTableRows } from '../utils';
import { FreeTimeActivitiesForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<FreeTimeActivitiesForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const freeTimeActivity = watch();
    setRows(
      getFreeTimeActivitiesTableRows([
        {
          nimi: freeTimeActivity.nimi,
          patevyydet: freeTimeActivity.patevyydet.map(
            (patevyys) =>
              ({
                nimi: patevyys.nimi,
                alkuPvm: patevyys.alkuPvm,
                loppuPvm: patevyys.loppuPvm,
                osaamiset: patevyys.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Patevyys,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('work-history.summary')}</h2>
      <ExperienceTable mainColumnHeader={t('free-time-activities.theme-or-activity')} rows={rows} />
    </>
  );
};

export default SummaryStep;
