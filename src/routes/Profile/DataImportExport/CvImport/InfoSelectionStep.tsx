import { Trans, useTranslation } from 'react-i18next';

import { EmptyState, Spinner } from '@jod/design-system';

import type { ExperienceTableRowData } from '@/components';
import { DataImportTable } from '@/components/DataImportTable/DataImportTable';

import type { CvImportConvertedData } from './utils';

interface SectionProps {
  className?: string;
  hasData: boolean;
  titleText: string;
  noDataText: string;
  toggleAllSelectionText: string;
  selectableCompetences?: boolean;
  rows?: ExperienceTableRowData[];
}

const Section = ({
  className,
  hasData,
  titleText: titleKey,
  noDataText,
  toggleAllSelectionText,
  selectableCompetences,
  rows,
}: SectionProps) => {
  return (
    <div className={className}>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleKey}</h2>
      {hasData && rows && (
        <DataImportTable
          rows={rows}
          toggleAllSelectionText={toggleAllSelectionText}
          showCompetences
          selectableCompetences={selectableCompetences}
        />
      )}
      {!hasData && <EmptyState text={noDataText} />}
    </div>
  );
};

interface InfoSelectionStepProps {
  isLoading: boolean;
  convertedData: CvImportConvertedData | null;
}

const InfoSelectionStep = ({ isLoading, convertedData }: InfoSelectionStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
      <p>
        <Trans i18nKey="preferences.cv-import.info-selection.description" />
      </p>
      {isLoading && (
        <div>
          <div className="mb-5 flex flex-row gap-5">
            <h2 className="text-heading-2-mobile sm:text-heading-2">
              {t('preferences.cv-import.info-selection.importing')}{' '}
            </h2>
            <Spinner size={24} color="accent" />
          </div>
          <ul className="ml-6 list-disc">
            <li>{t('preferences.cv-import.info-selection.education.loading')}</li>
            <li>{t('preferences.cv-import.info-selection.work.loading')}</li>
            <li>{t('preferences.cv-import.info-selection.activities.loading')}</li>
          </ul>
        </div>
      )}
      {!isLoading && (
        <>
          <Section
            hasData={Boolean(convertedData?.education.length)}
            titleText={t('preferences.cv-import.info-selection.education.title')}
            noDataText={t('preferences.cv-import.info-selection.education.no-data')}
            toggleAllSelectionText={t('education-history.education-provider-or-education')}
            selectableCompetences
            rows={convertedData?.education}
          />
          <Section
            hasData={Boolean(convertedData?.work.length)}
            titleText={t('preferences.cv-import.info-selection.work.title')}
            noDataText={t('preferences.cv-import.info-selection.work.no-data')}
            toggleAllSelectionText={t('work-history.workplace-or-job-description')}
            selectableCompetences
            rows={convertedData?.work}
          />
          <Section
            hasData={Boolean(convertedData?.activities.length)}
            titleText={t('preferences.cv-import.info-selection.activities.title')}
            noDataText={t('preferences.cv-import.info-selection.activities.no-data')}
            toggleAllSelectionText={t('free-time-activities.theme-or-activity')}
            rows={convertedData?.activities}
            className="mb-8"
          />
        </>
      )}
    </div>
  );
};

export default InfoSelectionStep;
