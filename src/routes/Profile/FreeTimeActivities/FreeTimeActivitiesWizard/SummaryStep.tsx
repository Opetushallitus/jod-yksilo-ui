import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { osaamiset } from '@/api/osaamiset';
import { ExperienceTable, type ExperienceTableRowData } from '@/components';

import { type Toiminto, getFreeTimeActivitiesTableRows } from '../utils';
import type { FreeTimeActivitiesForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<FreeTimeActivitiesForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const fetchRows = async () => {
      const freeTimeActivity = watch();

      const uris = freeTimeActivity.toiminnot.flatMap((toiminto) =>
        toiminto.osaamiset.map((osaaminen) => osaaminen.id),
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
              toiminnot: freeTimeActivity.toiminnot.map(
                (toiminto) =>
                  ({
                    nimi: toiminto.nimi,
                    alkuPvm: toiminto.alkuPvm,
                    loppuPvm: toiminto.loppuPvm,
                    osaamiset: toiminto.osaamiset.map((osaaminen) => osaaminen.id),
                  }) as Toiminto,
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
    <div>
      <p className="mb-6 box-content max-w-modal-content px-5 font-arial text-body-md-mobile sm:pr-0 sm:text-body-md md:px-9">
        {t('profile.free-time-activities.modals.summary-description')}
      </p>
      <div data-testid="free-time-summary-table" className="box-content max-w-modal-content md:px-6">
        <ExperienceTable
          insideModal
          ariaLabel={t('profile.free-time-activities.title')}
          mainColumnHeader={t('free-time-activities.theme-or-activity')}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default SummaryStep;
