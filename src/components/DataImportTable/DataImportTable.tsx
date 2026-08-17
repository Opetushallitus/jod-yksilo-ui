import React from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox, Tag, useMediaQueries } from '@jod/design-system';
import { JodCaretDown, JodCaretUp } from '@jod/design-system/icons';

import { AiInfo, type ExperienceTableRowData } from '@/components';
import { FreeFormTextRow } from '@/components/ExperienceTable/ExperienceTableRow';
import { formatDate, getLocalizedText, sortByProperty } from '@/utils';

export interface DataImportTableProps {
  rows: ExperienceTableRowData[];
  toggleAllSelectionText: string;
  /** Renders the competences column, the expandable competence rows and the AI disclaimer. */
  showCompetences?: boolean;
  /** Allows toggling individual competences. Requires {@link showCompetences}. */
  selectableCompetences?: boolean;
}

const uniqueCompetences = (osaamiset: ExperienceTableRowData['osaamiset']) => [
  ...new Map(osaamiset.map((osaaminen) => [osaaminen.id, osaaminen])).values(),
];

// The same competence can appear under several subrows, so it counts as selected if any of its instances is.
const competenceCounts = (osaamiset: ExperienceTableRowData['osaamiset']) => {
  const all = new Set<string>();
  const selected = new Set<string>();
  osaamiset.forEach((osaaminen) => {
    all.add(osaaminen.id);
    if (osaaminen.checked ?? false) {
      selected.add(osaaminen.id);
    }
  });
  return { total: all.size, selected: selected.size };
};

const setSelection = (row: ExperienceTableRowData, checked: boolean) => {
  row.checked = checked;
  row.osaamiset.forEach((osaaminen) => {
    osaaminen.checked = checked;
  });
  row.subrows?.forEach((subrow) => {
    setSelection(subrow, checked);
  });
};

const syncParentSelection = (row: ExperienceTableRowData) => {
  row.checked = (row.subrows ?? []).some((subrow) => subrow.checked ?? false);
};

export const DataImportTable = ({
  rows,
  toggleAllSelectionText,
  showCompetences = false,
  selectableCompetences = false,
}: DataImportTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const columnCount = sm ? (showCompetences ? 6 : 5) : 1;
  const [expandedOsaamiset, setExpandedOsaamiset] = React.useState<Set<string>>(
    () =>
      new Set(
        rows
          .flatMap((row) => row.subrows ?? [])
          .filter((subrow) => subrow.osaamiset.length > 0)
          .map((subrow) => subrow.key),
      ),
  );

  const toggleExpanded = (key: string) => {
    setExpandedOsaamiset((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderCompetencesCount = (osaamiset: ExperienceTableRowData['osaamiset']) => {
    const { total, selected } = competenceCounts(osaamiset);
    return selectableCompetences ? `${selected}/${total}` : `${total}`;
  };

  const renderCompetencesToggle = (subrow: ExperienceTableRowData) => {
    const competences = uniqueCompetences(subrow.osaamiset);
    if (competences.length === 0) {
      return <span className="text-secondary-gray">0</span>;
    }
    const expanded = expandedOsaamiset.has(subrow.key);
    return (
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${t('competences')} ${getLocalizedText(subrow.nimi)}`}
        onClick={() => toggleExpanded(subrow.key)}
        className="flex cursor-pointer items-center gap-x-2 text-secondary-gray"
        data-testid={`data-import-row-competences-toggle-${subrow.key}`}
      >
        <span>{renderCompetencesCount(subrow.osaamiset)}</span>
        {expanded ? <JodCaretUp aria-hidden="true" /> : <JodCaretDown aria-hidden="true" />}
      </button>
    );
  };

  const renderCompetencesRow = (row: ExperienceTableRowData, subrow: ExperienceTableRowData) => {
    const { key: rowKey } = subrow;
    const competences = uniqueCompetences(subrow.osaamiset).sort(sortByProperty(`nimi.${language}`));
    if (!expandedOsaamiset.has(rowKey) || competences.length === 0) {
      return null;
    }
    return (
      <tr data-testid={`data-import-row-competences-${rowKey}`}>
        <td colSpan={columnCount} className="pt-2 pr-4 pb-4 pl-6 sm:pr-5 sm:pl-9">
          <div className="grid grid-cols-[minmax(0,1fr)_2rem] items-start gap-x-3 rounded-md bg-bg-gray-2 p-3 sm:gap-x-4 sm:p-4">
            <div className="col-start-2 row-start-1 justify-self-end" data-testid="data-import-competence-ai-info">
              <AiInfo type="cv-import" size={20} />
            </div>
            <ul
              className="col-start-1 row-start-1 flex flex-wrap gap-3"
              aria-label={`${t('competences')} ${getLocalizedText(subrow.nimi)}`}
            >
              {competences.map((competence) => {
                const isSelected = competence.checked ?? false;

                return (
                  <li key={competence.id} className="max-w-full">
                    {selectableCompetences ? (
                      <Tag
                        label={getLocalizedText(competence.nimi)}
                        tooltip={getLocalizedText(competence.kuvaus)}
                        screenReaderTooltip={t('description-for', {
                          description: getLocalizedText(competence.kuvaus),
                        })}
                        variant={isSelected ? 'added' : 'selectable'}
                        sourceType={competence.sourceType ?? 'jotain-muuta'}
                        onClick={() => {
                          competence.checked = !isSelected;
                          if (competence.checked) {
                            subrow.checked = true;
                            syncParentSelection(row);
                          }
                          rerender();
                        }}
                        testId="data-import-competence-tag"
                      />
                    ) : (
                      <Tag
                        label={getLocalizedText(competence.nimi)}
                        tooltip={getLocalizedText(competence.kuvaus)}
                        screenReaderTooltip={t('description-for', {
                          description: getLocalizedText(competence.kuvaus),
                        })}
                        variant="presentation"
                        sourceType={competence.sourceType ?? 'jotain-muuta'}
                        testId="data-import-competence-tag"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </td>
      </tr>
    );
  };

  const isFullySelected = (subrow: ExperienceTableRowData) =>
    (subrow.checked ?? false) && (!selectableCompetences || subrow.osaamiset.every((o) => o.checked ?? false));

  const areSomeSubrowsChecked = (row: ExperienceTableRowData) =>
    (row.subrows ?? []).some((subrow) => subrow.checked ?? false);
  const areAllSubrowsChecked = (row: ExperienceTableRowData) => (row.subrows ?? []).every(isFullySelected);

  const someChecked = rows.some((row) => areSomeSubrowsChecked(row));
  const allChecked = rows.every((row) => areAllSubrowsChecked(row));
  const allUnchecked = !someChecked && !allChecked;

  // A hack to force re-rendering the component when checkbox states change
  const [, setForceRerender] = React.useState<boolean>(false);
  const rerender = () => setForceRerender((prev) => !prev);

  return (
    <table className="w-full border-collapse font-arial">
      <thead>
        <tr>
          <th
            className="border-b-2 border-border-gray pb-4 pl-3 text-left text-heading-5-mobile sm:pl-5 sm:text-heading-5"
            colSpan={sm ? 3 : 1}
          >
            <div className="flex items-center gap-x-3 sm:gap-x-5">
              <Checkbox
                name="checkbox-toggle-all"
                value="toggle-all"
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={() => {
                  const checked = (someChecked && !allChecked) || allUnchecked;
                  rows.forEach((row) => setSelection(row, checked));
                  rerender();
                }}
                ariaLabel={t('choose')}
                testId={`data-import-table-checkbox-toggle-all`}
              />
              {toggleAllSelectionText}
            </div>
          </th>
          {sm && (
            <>
              <th className="border-b-2 border-border-gray pb-4 text-left text-heading-5-mobile sm:px-6 sm:text-heading-5">
                {t('started')}
              </th>
              <th className="border-b-2 border-border-gray pb-4 text-left text-heading-5-mobile sm:pr-2 sm:text-heading-5">
                {t('ended')}
              </th>
              {showCompetences && (
                <th className="border-b-2 border-border-gray pb-4 text-left text-heading-5-mobile sm:pr-2 sm:text-heading-5">
                  {t('competences')}
                </th>
              )}
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <React.Fragment key={row.key}>
            <tr>
              <td
                className="bg-white py-3 pl-3 font-poppins text-heading-4-mobile sm:pl-5 sm:text-heading-4"
                colSpan={sm ? 3 : 1}
              >
                <div className={`flex ${sm ? 'flex-row' : 'flex-col'}`}>
                  <div className="flex items-center gap-3 sm:gap-5">
                    <Checkbox
                      name={`checkbox-${row.key}`}
                      value={row.key}
                      checked={areAllSubrowsChecked(row)}
                      indeterminate={areSomeSubrowsChecked(row) && !areAllSubrowsChecked(row)}
                      onChange={(e) => {
                        setSelection(row, e.target.checked);
                        rerender();
                      }}
                      ariaLabel={`${t('choose')} ${row.nimi[language]}`}
                      testId={`experience-row-checkbox-${row.key}`}
                    />
                    {getLocalizedText(row.nimi)}
                  </div>
                  {!sm && (
                    <div className="ml-6 flex gap-2 font-arial text-body-md text-secondary-gray sm:ml-7">
                      <span>{row.alkuPvm ? formatDate(row.alkuPvm) : ''}</span>
                      <span>-</span>
                      <span>{row.loppuPvm ? formatDate(row.loppuPvm) : ''}</span>
                    </div>
                  )}
                </div>
              </td>
              {sm && (
                <>
                  <td className="bg-white py-3 text-heading-5-mobile text-secondary-gray sm:px-6 sm:text-heading-5">
                    {row.alkuPvm ? formatDate(row.alkuPvm) : ''}
                  </td>
                  <td className="bg-white py-3 text-heading-5-mobile text-secondary-gray sm:pr-2 sm:text-heading-5">
                    {row.loppuPvm ? formatDate(row.loppuPvm) : ''}
                  </td>
                  {showCompetences && (
                    <td className="bg-white py-3 text-heading-5-mobile text-secondary-gray sm:pr-2 sm:text-heading-5">
                      <span data-testid={`data-import-row-competences-count-${row.key}`}>
                        {renderCompetencesCount((row.subrows ?? []).flatMap((subrow) => subrow.osaamiset))}
                      </span>
                    </td>
                  )}
                </>
              )}
            </tr>
            {(row.subrows ?? []).map((subrow, i) => (
              <React.Fragment key={subrow.key}>
                <tr className={i % 2 === 0 ? '' : 'bg-bg-gray-2'}>
                  <td className="py-3 pl-6 text-heading-5-mobile sm:pl-9 sm:text-heading-5" colSpan={sm ? 3 : 1}>
                    <div className={`flex ${sm ? 'flex-row' : 'flex-col'}`}>
                      <div className="flex items-center gap-3 sm:gap-5">
                        <Checkbox
                          name={`checkbox-${subrow.key}`}
                          value={subrow.key}
                          checked={isFullySelected(subrow)}
                          indeterminate={(subrow.checked ?? false) && !isFullySelected(subrow)}
                          onChange={(e) => {
                            setSelection(subrow, e.target.checked);
                            syncParentSelection(row);
                            rerender();
                          }}
                          ariaLabel={`${t('choose')} ${subrow.nimi[language]}`}
                          testId={`experience-row-checkbox-${subrow.key}`}
                        />
                        {getLocalizedText(subrow.nimi)}
                      </div>
                      {!sm && (
                        <div className="ml-6 flex gap-2 sm:ml-7">
                          <span>{subrow.alkuPvm ? formatDate(subrow.alkuPvm) : ''}</span>
                          <span>-</span>
                          <span>{subrow.loppuPvm ? formatDate(subrow.loppuPvm) : ''}</span>
                        </div>
                      )}
                      {!sm && showCompetences && subrow.osaamiset.length > 0 && (
                        <div className="ml-6 pt-1 sm:ml-7">{renderCompetencesToggle(subrow)}</div>
                      )}
                    </div>
                  </td>
                  {sm && (
                    <>
                      <td className="py-3 text-heading-5-mobile sm:px-6 sm:text-heading-5">
                        {subrow.alkuPvm ? formatDate(subrow.alkuPvm) : ''}
                      </td>
                      <td className="py-3 text-heading-5-mobile sm:pr-2 sm:text-heading-5">
                        {subrow.loppuPvm ? formatDate(subrow.loppuPvm) : ''}
                      </td>
                      {showCompetences && (
                        <td className="py-3 text-heading-5-mobile sm:pr-2 sm:text-heading-5">
                          {renderCompetencesToggle(subrow)}
                        </td>
                      )}
                    </>
                  )}
                </tr>
                {showCompetences && renderCompetencesRow(row, subrow)}
                {subrow.kuvaus && (
                  <FreeFormTextRow
                    row={subrow}
                    visibleState={true}
                    className={showCompetences ? 'pl-6 sm:pl-9' : undefined}
                    colSpan={columnCount}
                  />
                )}
              </React.Fragment>
            ))}
            <tr>
              <td colSpan={columnCount} className="pb-6" />
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};
