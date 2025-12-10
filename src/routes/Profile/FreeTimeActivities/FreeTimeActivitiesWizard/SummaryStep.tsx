import { osaamiset } from '@/api/osaamiset';
import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type Patevyys, getFreeTimeActivitiesTableRows } from '../utils';
import type { FreeTimeActivitiesForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<FreeTimeActivitiesForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const fetchRows = async () => {
      const freeTimeActivity = watch();

      const uris = freeTimeActivity.patevyydet.flatMap((patevyys) =>
        // eslint-disable-next-line sonarjs/no-nested-functions
        patevyys.osaamiset.map((osaaminen) => osaaminen.id),
      );
      const osaamisetData = await osaamiset.find(uris);
      const osaamisetMap: Record<string, { id: string; nimi: Record<string, string>; kuvaus: Record<string, string> }> =
        osaamisetData.reduce(
          (acc, osaaminen) => {
            acc[osaaminen.uri] = { id: osaaminen.uri, nimi: osaaminen.nimi, kuvaus: osaaminen.kuvaus };
            return acc;
          },
          {} as Record<string, { id: string; nimi: Record<string, string>; kuvaus: Record<string, string> }>,
        );

      setRows(
        getFreeTimeActivitiesTableRows(
          [
            {
              nimi: freeTimeActivity.nimi,
              patevyydet: freeTimeActivity.patevyydet.map(
                (patevyys) =>
                  ({
                    nimi: patevyys.nimi,
                    alkuPvm: patevyys.alkuPvm,
                    loppuPvm: patevyys.loppuPvm,
                    // eslint-disable-next-line sonarjs/no-nested-functions
                    osaamiset: patevyys.osaamiset.map((osaaminen) => osaaminen.id),
                  }) as Patevyys,
              ),
            },
          ],
          osaamisetMap,
        ),
      );
    };

    void fetchRows();
  }, [watch]);

  return (
    <>
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
