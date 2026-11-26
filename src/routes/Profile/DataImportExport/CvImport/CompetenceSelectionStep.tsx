import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { CompetenceSection, getSelectedRows } from '@/components/CompetenceSection/CompetenceSection';

import { CvImportConvertedData } from './utils';

interface CompetenceSelectionStepProps {
  convertedData: CvImportConvertedData | null;
}
export const CompetenceSelectionStep = ({ convertedData }: CompetenceSelectionStepProps) => {
  const { t } = useTranslation();
  const [, rerender] = React.useReducer((x: number) => x + 1, 0);

  return (
    <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
      <p>
        <Trans i18nKey="preferences.cv-import.competence-selection.description" />
      </p>
      <div className="flex flex-col gap-7">
        <CompetenceSection
          titleText={t('preferences.cv-import.competence-selection.education.title')}
          headerText={t('education-history.education-provider-or-education')}
          rows={getSelectedRows(convertedData?.education)}
          onCompetenceChange={rerender}
          failingDetection={t('preferences.cv-import.competence-selection.education.failing-detection')}
        />

        <CompetenceSection
          titleText={t('preferences.cv-import.competence-selection.work.title')}
          headerText={t('work-history.workplace-or-job-description')}
          rows={getSelectedRows(convertedData?.work)}
          onCompetenceChange={rerender}
          failingDetection={t('preferences.cv-import.competence-selection.work.failing-detection')}
        />

        <CompetenceSection
          titleText={t('preferences.cv-import.competence-selection.activities.title')}
          headerText={t('free-time-activities.theme-or-activity')}
          rows={getSelectedRows(convertedData?.activities)}
          onCompetenceChange={rerender}
          failingDetection={t('preferences.cv-import.competence-selection.activities.failing-detection')}
        />
      </div>
    </div>
  );
};
