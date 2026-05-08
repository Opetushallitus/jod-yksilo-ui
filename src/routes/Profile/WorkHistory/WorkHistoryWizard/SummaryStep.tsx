import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { osaamiset } from '@/api/osaamiset';
import { ExperienceTable, type ExperienceTableRowData } from '@/components';

import { Toimenkuva, getWorkHistoryTableRows } from '../utils';
import { type WorkHistoryForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<WorkHistoryForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const fetchRows = async () => {
      const tyopaikka = watch();

      const uris = tyopaikka.toimenkuvat.flatMap((toimenkuva) => toimenkuva.osaamiset.map((osaaminen) => osaaminen.id));
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
        getWorkHistoryTableRows(
          [
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
          ],
          osaamisetMap,
        ),
      );
    };

    void fetchRows();
  }, [watch]);

  return (
    <div>
      <p className="mb-6 box-content max-w-modal-content px-5 font-arial text-body-md-mobile sm:text-body-md md:px-9">
        {t('profile.work-history.modals.summary-description')}
      </p>
      <div data-testid="work-history-summary-table" className="box-content max-w-modal-content md:px-6">
        <ExperienceTable
          insideModal
          ariaLabel={t('profile.work-history.title')}
          mainColumnHeader={t('work-history.workplace-or-job-description')}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default SummaryStep;
