import { Trans, useTranslation } from 'react-i18next';

import { EmptyState, Spinner } from '@jod/design-system';

import type { ExperienceTableRowData } from '@/components';
import { DataImportTable } from '@/components/DataImportTable/DataImportTable';

import type { CvImportConvertedData } from './utils';

interface SectionProps {
  hasData: boolean;
  titleText: string;
  noDataText: string;
  toggleAllSelectionText: string;
  rows?: ExperienceTableRowData[];
}

const Section = ({ hasData, titleText: titleKey, noDataText, toggleAllSelectionText, rows }: SectionProps) => {
  return (
    <div>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleKey}</h2>
      {hasData && rows && <DataImportTable rows={rows} toggleAllSelectionText={toggleAllSelectionText} />}
      {!hasData && <EmptyState text={noDataText} />}
    </div>
  );
};

interface SummaryStepProps {
  isLoading: boolean;
  convertedData: CvImportConvertedData | null;
}

const SummaryStep = ({ isLoading, convertedData }: SummaryStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:px-9">
      <p>
        <Trans i18nKey="preferences.cv-import.summary.description" />
      </p>
      {isLoading && (
        <div>
          <div className="mb-5 flex flex-row gap-5">
            <h2 className="text-heading-2-mobile sm:text-heading-2">{t('preferences.cv-import.summary.importing')} </h2>
            <Spinner size={24} color="accent" />
          </div>
          <ul className="ml-6 list-disc">
            <li>{t('preferences.cv-import.summary.education.loading')}</li>
            <li>{t('preferences.cv-import.summary.work.loading')}</li>
            <li>{t('preferences.cv-import.summary.activities.loading')}</li>
          </ul>
        </div>
      )}
      {!isLoading && (
        <>
          <Section
            hasData={Boolean(convertedData?.education.length)}
            titleText={t('preferences.cv-import.summary.education.title')}
            noDataText={t('preferences.cv-import.summary.education.no-data')}
            toggleAllSelectionText={t('education-history.education-provider-or-education')}
            rows={convertedData?.education}
          />
          <Section
            hasData={Boolean(convertedData?.work.length)}
            titleText={t('preferences.cv-import.summary.work.title')}
            noDataText={t('preferences.cv-import.summary.work.no-data')}
            toggleAllSelectionText={t('work-history.workplace-or-job-description')}
            rows={convertedData?.work}
          />
          <Section
            hasData={Boolean(convertedData?.activities.length)}
            titleText={t('preferences.cv-import.summary.activities.title')}
            noDataText={t('preferences.cv-import.summary.activities.no-data')}
            toggleAllSelectionText={t('free-time-activities.theme-or-activity')}
            rows={convertedData?.activities}
          />
        </>
      )}
    </div>
  );
};

export default SummaryStep;
