import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Accordion, Tag } from '@jod/design-system';

import type { ExperienceTableRowData } from '@/components';
import { getLocalizedText } from '@/utils';

import { CvImportConvertedData } from './utils';

const getSelectedRows = (rows?: ExperienceTableRowData[]) =>
  rows?.flatMap((row) => {
    const subrows = row.subrows?.filter((subrow) => subrow.checked ?? false);
    return subrows?.length ? [{ ...row, subrows }] : [];
  });

const uniqueCompetences = (osaamiset: ExperienceTableRowData['osaamiset']) => [
  ...new Map(osaamiset.map((osaaminen) => [osaaminen.id, osaaminen])).values(),
];

interface SectionProps {
  titleText: string;
  headerText: string;
  rows?: ExperienceTableRowData[];
  onCompetenceChange: () => void;
}

const Section = ({ titleText, headerText, rows, onCompetenceChange }: SectionProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleText}</h2>
      {rows && (
        <div className="px-4">
          <div className="mb-6 flex w-full flex-row justify-between border-b-2 border-primary-5-light-2 text-primary-gray">
            <p className="text-heading-5-mobile sm:text-heading-5">{headerText}</p>
            <p>{t('preferences.cv-import.competence-selection.competences')}</p>
          </div>
          {rows.map((row) => (
            <div key={row.key} className="py-4">
              <h3 className="font-poppins text-heading-4-mobile sm:text-heading-4">{getLocalizedText(row.nimi)}</h3>
              <div className="flex flex-col gap-7 pt-6">
                {row.subrows?.map((subrow) => {
                  const competences = uniqueCompetences(subrow.osaamiset);
                  const selectedCompetences = competences.filter((osaaminen) => osaaminen.checked ?? false).length;

                  return (
                    <div key={subrow.key} className="pl-7">
                      <Accordion
                        ariaLabel={getLocalizedText(subrow.nimi)}
                        title={
                          <div className="flex flex-row justify-between">
                            <h4 className="text-heading-5-mobile sm:text-heading-5">{getLocalizedText(subrow.nimi)}</h4>
                            <p className="text-body-md-mobile text-secondary-gray sm:text-body-md">
                              {t('preferences.cv-import.competence-selection.selected-competences', {
                                selected: selectedCompetences,
                                total: competences.length,
                              })}
                            </p>
                          </div>
                        }
                      >
                        <div className="mt-3 border-l-4 border-border-gray bg-white">
                          <div className="flex flex-col py-2 pl-3">
                            <p className="text-heading-4-mobile sm:text-heading-4">
                              {t('preferences.cv-import.competence-selection.select-competences')}
                            </p>
                            <p className="text-help text-secondary-gray">
                              {t('preferences.cv-import.competence-selection.add-competence')}
                            </p>
                            <ul className="flex flex-wrap gap-3 py-3">
                              {competences.map((osaaminen) => (
                                <li key={osaaminen.id} className="max-w-full">
                                  <Tag
                                    label={getLocalizedText(osaaminen.nimi)}
                                    tooltip={getLocalizedText(osaaminen.kuvaus)}
                                    screenReaderTooltip={t('description-for', {
                                      description: getLocalizedText(osaaminen.kuvaus),
                                    })}
                                    hollow={!osaaminen.checked}
                                    variant={osaaminen.checked ? 'added' : 'selectable'}
                                    sourceType={osaaminen.sourceType ?? 'jotain-muuta'}
                                    onClick={() => {
                                      osaaminen.checked = !osaaminen.checked;
                                      onCompetenceChange();
                                    }}
                                    testId="cv-import-competence-tag"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Accordion>
                    </div>
                  );
                })}
              </div>
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
  const [, setForceRerender] = React.useState(false);
  const rerender = () => setForceRerender((previous) => !previous);

  return (
    <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
      <p>
        <Trans i18nKey="preferences.cv-import.competence-selection.description" />
      </p>
      <div className="flex flex-col gap-7">
        <Section
          titleText={t('preferences.cv-import.competence-selection.education.title')}
          headerText={t('education-history.education-provider-or-education')}
          rows={getSelectedRows(convertedData?.education)}
          onCompetenceChange={rerender}
        />

        <Section
          titleText={t('preferences.cv-import.competence-selection.work.title')}
          headerText={t('work-history.workplace-or-job-description')}
          rows={getSelectedRows(convertedData?.work)}
          onCompetenceChange={rerender}
        />

        <Section
          titleText={t('preferences.cv-import.competence-selection.activities.title')}
          headerText={t('free-time-activities.theme-or-activity')}
          rows={getSelectedRows(convertedData?.activities)}
          onCompetenceChange={rerender}
        />
      </div>
    </div>
  );
};
