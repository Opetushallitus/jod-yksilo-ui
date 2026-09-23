import React from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox, useMediaQueries } from '@jod/design-system';

import { type ExperienceTableRowData } from '@/components';
import { FreeFormTextRow } from '@/components/ExperienceTable/ExperienceTableRow';
import { formatDate, getLocalizedText } from '@/utils';

export interface DataImportTableProps {
  rows: ExperienceTableRowData[];
  toggleAllSelectionText: string;
  onSelectionChange?: () => void;
  selectCompetencesWithRow?: boolean;
  showDescription?: boolean;
  alternatingBg?: boolean;
}

const setSelection = (row: ExperienceTableRowData, checked: boolean, selectCompetencesWithRow: boolean) => {
  row.checked = checked;
  if (selectCompetencesWithRow) {
    row.osaamiset.forEach((osaaminen) => {
      osaaminen.checked = checked;
    });
  }
  row.subrows?.forEach((subrow) => {
    setSelection(subrow, checked, selectCompetencesWithRow);
  });
};

const syncParentSelection = (row: ExperienceTableRowData) => {
  row.checked = (row.subrows ?? []).some((subrow) => subrow.checked ?? false);
};

export const DataImportTable = ({
  rows,
  toggleAllSelectionText,
  onSelectionChange,
  selectCompetencesWithRow = true,
  showDescription = true,
  alternatingBg = true,
}: DataImportTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const columnCount = sm ? 5 : 1;

  const isChecked = (subrow: ExperienceTableRowData) => subrow.checked ?? false;

  // Rows without subrows fall back to their own checked state
  const isRowAnyChecked = (row: ExperienceTableRowData) =>
    row.subrows?.length ? row.subrows.some(isChecked) : isChecked(row);
  const isRowFullyChecked = (row: ExperienceTableRowData) =>
    row.subrows?.length ? row.subrows.every(isChecked) : isChecked(row);

  const someChecked = rows.some((row) => isRowAnyChecked(row));
  const allChecked = rows.every((row) => isRowFullyChecked(row));

  // A hack to force re-rendering the component when checkbox states change
  const [, forceRerender] = React.useReducer((x: number) => x + 1, 0);
  const rerender = () => {
    forceRerender();
    onSelectionChange?.();
  };

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
                  rows.forEach((row) => setSelection(row, !allChecked, selectCompetencesWithRow));
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
                      checked={isRowFullyChecked(row)}
                      indeterminate={isRowAnyChecked(row) && !isRowFullyChecked(row)}
                      onChange={(e) => {
                        setSelection(row, e.target.checked, selectCompetencesWithRow);
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
                </>
              )}
            </tr>
            {(row.subrows ?? []).map((subrow, i) => (
              <React.Fragment key={subrow.key}>
                <tr className={alternatingBg && i % 2 === 1 ? 'bg-bg-gray-2' : ''}>
                  <td className="py-3 pl-6 text-heading-5-mobile sm:pl-9 sm:text-heading-5" colSpan={sm ? 3 : 1}>
                    <div className={`flex ${sm ? 'flex-row' : 'flex-col'}`}>
                      <div className="flex items-center gap-3 sm:gap-5">
                        <Checkbox
                          name={`checkbox-${subrow.key}`}
                          value={subrow.key}
                          checked={isChecked(subrow)}
                          onChange={(e) => {
                            setSelection(subrow, e.target.checked, selectCompetencesWithRow);
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
                    </>
                  )}
                </tr>
                {subrow.kuvaus && showDescription && (
                  <FreeFormTextRow row={subrow} visibleState={true} colSpan={columnCount} />
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
