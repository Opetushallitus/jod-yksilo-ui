import { ExperienceTable, type ExperienceTableRowData } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Koulutus, getEducationHistoryTableRows } from '../utils';
import { type EducationHistoryForm } from './utils';

interface SummaryStepProps {
  headerText: string;
}

const SummaryStep = ({ headerText }: SummaryStepProps) => {
  const { t } = useTranslation();
  const { watch } = useFormContext<EducationHistoryForm>();
  const [rows, setRows] = React.useState<ExperienceTableRowData[]>([]);

  React.useEffect(() => {
    const koulutuskokonaisuus = watch();
    setRows(
      getEducationHistoryTableRows([
        {
          nimi: koulutuskokonaisuus.nimi,
          koulutukset: koulutuskokonaisuus.koulutukset.map(
            (koulutus) =>
              ({
                nimi: koulutus.nimi,
                alkuPvm: koulutus.alkuPvm,
                loppuPvm: koulutus.loppuPvm,
                osaamiset: koulutus.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Koulutus,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <ModalHeader text={headerText} />
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
