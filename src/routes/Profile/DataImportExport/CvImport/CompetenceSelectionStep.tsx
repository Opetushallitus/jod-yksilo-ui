import { Trans, useTranslation } from 'react-i18next';

import type { ExperienceTableRowData } from '@/components';
import { getLocalizedText } from '@/utils';

import { CvImportConvertedData } from './utils';

interface SectionProps {
  titleText: string;
  headerText: string;
  rows?: ExperienceTableRowData[];
}

const Section = ({ titleText, headerText, rows }: SectionProps) => {
  return (
    <div>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleText}</h2>
      {rows && (
        <div className="px-4">
          <div className="flex flex-row justify-between border-b-2 border-primary-5-light-2">
            <p className="text-heading-5-mobile sm:text-heading-5">{headerText}</p>
            <p>TODO: Osaamiset</p>
          </div>
          {rows.map((row) => (
            <div key={row.key} className="py-4">
              <h3 className="font-poppins text-heading-4-mobile sm:text-heading-4">{getLocalizedText(row.nimi)}</h3>
              {row.subrows?.map((subrow) => (
                <div key={subrow.key}>{getLocalizedText(subrow.nimi)}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CompetenceSelectionStepProps {
  convertedData: CvImportConvertedData | null;
}
export const CompetenceSelectionStep = ({ convertedData }: CompetenceSelectionStepProps) => {
  const { t } = useTranslation();
  //
  return (
    <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
      <p>
        <Trans i18nKey="preferences.cv-import.competence-selection.description" />
      </p>
      <div className="flex flex-col gap-7">
        <Section
          titleText={t('preferences.cv-import.competence-selection.education.title')}
          headerText={t('education-history.education-provider-or-education')}
          rows={convertedData?.education}
        />

        <Section
          titleText={t('preferences.cv-import.competence-selection.work.title')}
          headerText={t('work-history.workplace-or-job-description')}
          rows={convertedData?.work}
        />

        <Section
          titleText={t('preferences.cv-import.competence-selection.activities.title')}
          headerText={t('free-time-activities.theme-or-activity')}
          rows={convertedData?.activities}
        />
      </div>
    </div>
  );
};
