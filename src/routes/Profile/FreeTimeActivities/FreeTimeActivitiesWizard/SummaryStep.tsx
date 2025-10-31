import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type Patevyys, getFreeTimeActivitiesTableRows } from '../utils';
import type { FreeTimeActivitiesForm } from './utils';

interface SummaryStepProps {
  headerText: string;
}

const SummaryStep = ({ headerText }: SummaryStepProps) => {
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
      <ModalHeader text={headerText} testId="free-time-competences-summary" />
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.free-time-activities.modals.summary-description')}
      </p>
      <div data-testid="free-time-summary-table">
        <ExperienceTable
          ariaLabel={t('profile.free-time-activities.title')}
          mainColumnHeader={t('free-time-activities.theme-or-activity')}
          rows={rows}
        />
      </div>
    </>
  );
};

export default SummaryStep;
