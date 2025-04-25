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
      <h2 className="mb-4 text-black text-hero-mobile sm:text-hero">{t('free-time-activities.summary')}</h2>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.summary-description')}
      </p>
      <ExperienceTable mainColumnHeader={t('free-time-activities.theme-or-activity')} rows={rows} />
    </>
  );
};

export default SummaryStep;
