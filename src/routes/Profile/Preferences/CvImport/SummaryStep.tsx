import { Trans, useTranslation } from 'react-i18next';

import { EmptyState, Spinner } from '@jod/design-system';

import type { ExperienceTableRowData } from '@/components';
import { DataImportTable } from '@/components/DataImportTable/DataImportTable';

import type { CvImportConvertedData } from './utils';

interface SectionProps {
  isLoading: boolean;
  hasData: boolean;
  titleText: string;
  loadingText: string;
  noDataText: string;
  toggleAllSelectionText: string;
  rows?: ExperienceTableRowData[];
}

const Section = ({
  isLoading,
  hasData,
  titleText: titleKey,
  loadingText,
  noDataText,
  toggleAllSelectionText,
  rows,
}: SectionProps) => {
  return (
    <div>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleKey}</h2>
      {isLoading && (
        <div className="flex flex-row gap-5">
          <Spinner size={24} color="accent" />
          <p className="text-body-md">{loadingText}</p>
        </div>
      )}
      {!isLoading && hasData && rows && <DataImportTable rows={rows} toggleAllSelectionText={toggleAllSelectionText} />}
      {!isLoading && !hasData && <EmptyState text={noDataText} />}
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
      <Section
        isLoading={isLoading}
        hasData={Boolean(convertedData?.education.length)}
        titleText={t('preferences.cv-import.summary.education.title')}
        loadingText={t('preferences.cv-import.summary.education.loading')}
        noDataText={t('preferences.cv-import.summary.education.no-data')}
        toggleAllSelectionText={t('education-history.education-provider-or-education')}
        rows={convertedData?.education}
      />
      <Section
        isLoading={isLoading}
        hasData={Boolean(convertedData?.work.length)}
        titleText={t('preferences.cv-import.summary.work.title')}
        loadingText={t('preferences.cv-import.summary.work.loading')}
        noDataText={t('preferences.cv-import.summary.work.no-data')}
        toggleAllSelectionText={t('work-history.workplace-or-job-description')}
        rows={convertedData?.work}
      />
      <Section
        isLoading={isLoading}
        hasData={Boolean(convertedData?.activities.length)}
        titleText={t('preferences.cv-import.summary.activities.title')}
        loadingText={t('preferences.cv-import.summary.activities.loading')}
        noDataText={t('preferences.cv-import.summary.activities.no-data')}
        toggleAllSelectionText={t('free-time-activities.theme-or-activity')}
        rows={convertedData?.activities}
      />
    </div>
  );
};

export default SummaryStep;
