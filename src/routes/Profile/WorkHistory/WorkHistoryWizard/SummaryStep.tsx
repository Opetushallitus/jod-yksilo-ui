import { osaamiset } from '@/api/osaamiset';
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
    const fetchRows = async () => {
      const tyopaikka = watch();

      // eslint-disable-next-line sonarjs/no-nested-functions
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
                    // eslint-disable-next-line sonarjs/no-nested-functions
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
    <>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('profile.work-history.modals.summary-description')}
      </p>
      <div data-testid="work-history-summary-table">
        <ExperienceTable
          ariaLabel={t('profile.work-history.title')}
          mainColumnHeader={t('work-history.workplace-or-job-description')}
          rows={rows}
        />
      </div>
    </>
  );
};

export default SummaryStep;
