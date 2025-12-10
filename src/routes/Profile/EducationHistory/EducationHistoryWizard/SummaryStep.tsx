import { osaamiset } from '@/api/osaamiset';
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
    const fetchRows = async () => {
      const koulutuskokonaisuus = watch();

      const uris = koulutuskokonaisuus.koulutukset.flatMap((koulutus) =>
        // eslint-disable-next-line sonarjs/no-nested-functions
        koulutus.osaamiset.map((osaaminen) => osaaminen.id),
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
        getEducationHistoryTableRows(
          [
            {
              nimi: koulutuskokonaisuus.nimi,
              koulutukset: koulutuskokonaisuus.koulutukset.map(
                (koulutus) =>
                  ({
                    nimi: koulutus.nimi,
                    alkuPvm: koulutus.alkuPvm,
                    loppuPvm: koulutus.loppuPvm,
                    // eslint-disable-next-line sonarjs/no-nested-functions
                    osaamiset: koulutus.osaamiset.map((osaaminen) => osaaminen.id),
                  }) as Koulutus,
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
        {t('profile.education-history.modals.summary-description')}
      </p>
      <div data-testid="education-history-summary-table">
        <ExperienceTable
          ariaLabel={t('profile.education-history.title')}
          mainColumnHeader={t('education-history.education-provider-or-education')}
          rows={rows}
        />
      </div>
    </>
  );
};

export default SummaryStep;
