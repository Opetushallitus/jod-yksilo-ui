import React from 'react';
import { useTranslation } from 'react-i18next';

import { Accordion, Tag } from '@jod/design-system';

import type { ExperienceTableRowData } from '@/components';
import { ImportInfoBox } from '@/components/ImportInfoBox/ImportInfoBox';
import { getLocalizedText } from '@/utils';

export const getSelectedRows = (rows?: ExperienceTableRowData[]) =>
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
  failingDetection: string;
}

interface SubrowAccordionProps {
  title: string;
  selectedText?: string;
  children: React.ReactNode;
}

const SubrowAccordion = ({ title, selectedText, children }: SubrowAccordionProps) => (
  <Accordion
    ariaLabel={title}
    ellipsis={false}
    caretPosition="top"
    title={
      <div className="flex flex-row justify-between gap-x-4">
        <h4 className="text-heading-5-mobile sm:text-heading-5">{title}</h4>
        {selectedText && (
          <p className="shrink-0 text-body-md-mobile whitespace-nowrap text-secondary-gray sm:text-body-md">
            {selectedText}
          </p>
        )}
      </div>
    }
  >
    {children}
  </Accordion>
);

interface CompetenceTagsProps {
  competences: ExperienceTableRowData['osaamiset'];
  onCompetenceChange: () => void;
}

const CompetenceTags = ({ competences, onCompetenceChange }: CompetenceTagsProps) => {
  const { t } = useTranslation();
  return (
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
  );
};

interface SubrowCompetencesProps {
  subrow: ExperienceTableRowData;
  onCompetenceChange: () => void;
  failingDetection: string;
}

const SubrowCompetences = ({ subrow, onCompetenceChange, failingDetection }: SubrowCompetencesProps) => {
  const { t } = useTranslation();
  const title = getLocalizedText(subrow.nimi);
  const competences = uniqueCompetences(subrow.osaamiset);

  if (competences.length === 0) {
    return (
      <SubrowAccordion title={title}>
        <ImportInfoBox>{failingDetection}</ImportInfoBox>
      </SubrowAccordion>
    );
  }

  const selectedText = t('preferences.cv-import.competence-selection.selected-competences', {
    selected: competences.filter((osaaminen) => osaaminen.checked ?? false).length,
    total: competences.length,
  });

  return (
    <SubrowAccordion title={title} selectedText={selectedText}>
      <CompetenceTags competences={competences} onCompetenceChange={onCompetenceChange} />
    </SubrowAccordion>
  );
};

export const CompetenceSection = ({
  titleText,
  headerText,
  rows,
  onCompetenceChange,
  failingDetection,
}: SectionProps) => {
  const { t } = useTranslation();

  if (!rows?.length) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">{titleText}</h2>
      <div className="font-arial text-primary-gray">
        <div className="flex flex-row justify-between gap-x-4 border-b-2 border-border-gray px-4 pb-4">
          <p className="text-heading-5-mobile sm:text-heading-5">{headerText}</p>
          <p>{t('preferences.cv-import.competence-selection.competences')}</p>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="pb-6">
            <h3 className="px-4 py-3 font-poppins text-heading-4-mobile sm:text-heading-4">
              {getLocalizedText(row.nimi)}
            </h3>
            {row.subrows?.map((subrow) => (
              <div key={subrow.key} className="py-3 pr-4 pl-11">
                <SubrowCompetences
                  subrow={subrow}
                  onCompetenceChange={onCompetenceChange}
                  failingDetection={failingDetection}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
