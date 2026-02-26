import { Button, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExperienceTableRow, type ExperienceTableRowData } from './ExperienceTableRow';

interface ExperienceTableProps {
  mainColumnHeader: string;
  addNewLabel?: string;
  addNewNestedLabel?: string;
  rows: ExperienceTableRowData[];
  onAddClick?: () => void;
  onRowClick?: (row: ExperienceTableRowData) => void;
  onNestedRowClick?: (row: ExperienceTableRowData) => void;
  onAddNestedRowClick?: (row: ExperienceTableRowData) => void;
  hideOsaamiset?: boolean;
  rowActionElement?: React.ReactNode;
  useConfirm?: boolean;
  confirmTitle?: string;
  confirmRowDescription?: string;
  confirmSubRowDescription?: string;
  actionLabel?: string;
  showCheckbox?: boolean;
  checkboxColumnHeader?: string;
  onCheckboxChange?: (rowKey: string, checked: boolean) => void;
  onSubCheckboxChange?: (rowKey: string, subRowKey: string, checked: boolean) => void;
  ariaLabel: string;
  isPrinting?: boolean;
  /** Imported koulutukset whose osaamiset needs to be checked by the user */
  koulutuksetThatNeedUserVerification?: string[];
  /** Function to mark the osaamiset of a specific koulutus as verified */
  verifyKoulutusOsaamiset?: (koulutusId: string) => void;
}

export const ExperienceTable = ({
  mainColumnHeader,
  addNewLabel,
  addNewNestedLabel,
  rows,
  onAddClick,
  onRowClick,
  onNestedRowClick,
  onAddNestedRowClick,
  hideOsaamiset,
  rowActionElement,
  useConfirm,
  confirmTitle,
  confirmRowDescription,
  confirmSubRowDescription,
  actionLabel,
  showCheckbox,
  checkboxColumnHeader,
  onCheckboxChange,
  onSubCheckboxChange,
  koulutuksetThatNeedUserVerification,
  verifyKoulutusOsaamiset,
  ariaLabel,
  isPrinting = false,
}: ExperienceTableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  // To track Checkbox checked status with indeterminate state.
  const [rowsCheckboxState, setRowsCheckboxState] = React.useState<
    Map<
      string,
      {
        checked: boolean;
        indeterminate: boolean;
        subRows: Map<string, boolean>;
      }
    >
  >(new Map());

  // Initialize row state from props.
  React.useEffect(() => {
    const newRowsCheckboxState = new Map();

    rows.forEach((row) => {
      const subRowsMap = new Map();
      if (row.subrows) {
        row.subrows.forEach((subrow) => {
          subRowsMap.set(subrow.key, subrow.checked ?? false);
        });
      }

      // Calculate parent state
      const allSubRowsChecked = row.subrows?.every((subRow) => subRow.checked) ?? false;
      const someSubRowsChecked = row.subrows?.some((subRow) => subRow.checked) ?? false;

      newRowsCheckboxState.set(row.key, {
        checked: allSubRowsChecked,
        indeterminate: !allSubRowsChecked && someSubRowsChecked,
        subRows: subRowsMap,
      });
    });

    setRowsCheckboxState(newRowsCheckboxState);
  }, [rows]);

  const handleParentCheckboxChange = (row: ExperienceTableRowData, checked: boolean) => {
    const rowState = rowsCheckboxState.get(row.key);
    if (!rowState) return;

    const updatedRowsState = new Map(rowsCheckboxState);
    const updatedSubRows = new Map(rowState.subRows);

    // Update all subrows to match parent's checked state
    updatedRowsState.set(row.key, {
      checked,
      indeterminate: false,
      subRows: updatedSubRows,
    });

    // Update all subrows
    if (row.subrows) {
      row.subrows.forEach((subrow) => {
        updatedSubRows.set(subrow.key, checked);
        subrow.checked = checked;

        if (onSubCheckboxChange) {
          onSubCheckboxChange(row.key, subrow.key, checked);
        }
      });
    }

    setRowsCheckboxState(updatedRowsState);

    if (onCheckboxChange) {
      onCheckboxChange(row.key, checked);
    }
  };

  const handleSubCheckboxChange = (row: ExperienceTableRowData, subrow: ExperienceTableRowData, checked: boolean) => {
    const rowState = rowsCheckboxState.get(row.key);
    if (!rowState) return;

    const updatedRowsState = new Map(rowsCheckboxState);
    const updatedSubRows = new Map(rowState.subRows);

    // Update the specific subrow
    updatedSubRows.set(subrow.key, checked);
    subrow.checked = checked;

    // Calculate new parent state
    const allChecked = Array.from(updatedSubRows.values()).every((isChecked) => isChecked);
    const someChecked = Array.from(updatedSubRows.values()).some((isChecked) => isChecked);

    updatedRowsState.set(row.key, {
      checked: allChecked,
      indeterminate: !allChecked && someChecked,
      subRows: updatedSubRows,
    });

    setRowsCheckboxState(updatedRowsState);

    if (onSubCheckboxChange) {
      onSubCheckboxChange(row.key, subrow.key, checked);
    }
  };

  const uncategorizedRows = rows.filter((row) => !row.subrows);
  const categorizedRows = rows.filter((row) => row.subrows);

  return (
    <div data-testid="experience-table">
      {rows.length > 0 && (
        <table
          className="w-full font-arial"
          border={0}
          cellPadding={0}
          cellSpacing={0}
          data-testid="experience-table-grid"
          aria-label={ariaLabel}
        >
          <thead className="after:content-[''] after:block after:h-5">
            <tr className="border-b border-inactive-gray text-left text-body-md">
              <th scope="col" colSpan={sm ? 1 : 3} className="pr-7 pb-3 font-normal pl-4">
                {mainColumnHeader}
              </th>

              {sm && (
                <>
                  <th scope="col" className="pr-7 pb-3 font-normal">
                    {t('started')}
                  </th>
                  <th scope="col" className="pr-7 pb-3 font-normal">
                    {t('ended')}
                  </th>
                </>
              )}

              {!hideOsaamiset && (
                <th
                  scope="col"
                  colSpan={sm ? 1 : 2}
                  className={`text-end pb-3 font-normal ${onNestedRowClick ? 'pr-7' : 'pr-5'}`.trim()}
                >
                  {t('competences')}
                </th>
              )}

              {sm && showCheckbox && (
                <th scope="col" className="pr-5 pb-3">
                  {checkboxColumnHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {categorizedRows.map((row, index) => (
              <React.Fragment key={row.key}>
                {index > 0 && showCheckbox && (
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                )}
                <ExperienceTableRow
                  openFromTopLevel
                  key={row.key}
                  row={row}
                  onRowClick={onRowClick}
                  className="bg-white border-spacing-x-2"
                  hideOsaamiset={hideOsaamiset}
                  osaamisetOdottaaTunnistusta={
                    row.subrows?.some((subrow) => subrow.osaamisetOdottaaTunnistusta) ?? row.osaamisetOdottaaTunnistusta
                  }
                  osaamisetTunnistusEpaonnistui={
                    row.subrows?.some((subrow) => subrow.osaamisetTunnistusEpaonnistui) ??
                    row.osaamisetTunnistusEpaonnistui
                  }
                  rowActionElement={rowActionElement}
                  useConfirm={useConfirm}
                  confirmTitle={confirmTitle}
                  isPrinting={isPrinting}
                  confirmDescription={confirmRowDescription}
                  actionLabel={actionLabel}
                  showCheckbox={showCheckbox}
                  checked={rowsCheckboxState.get(row.key)?.checked ?? false}
                  indeterminate={rowsCheckboxState.get(row.key)?.indeterminate ?? false}
                  onCheckboxChange={(checked) => handleParentCheckboxChange(row, checked)}
                  koulutuksetThatNeedUserVerification={koulutuksetThatNeedUserVerification}
                  verifyKoulutusOsaamiset={verifyKoulutusOsaamiset}
                />
                {row.subrows?.map((subrow, i) => (
                  <ExperienceTableRow
                    key={subrow.key}
                    row={subrow}
                    onRowClick={onNestedRowClick}
                    isOdd={i % 2 !== 0}
                    className={i % 2 !== 0 ? 'bg-bg-gray-2' : 'bg-bg-gray'}
                    nested
                    hideOsaamiset={hideOsaamiset}
                    osaamisetOdottaaTunnistusta={subrow.osaamisetOdottaaTunnistusta}
                    osaamisetTunnistusEpaonnistui={subrow.osaamisetTunnistusEpaonnistui}
                    rowActionElement={rowActionElement}
                    useConfirm={useConfirm}
                    confirmTitle={confirmTitle}
                    confirmDescription={confirmSubRowDescription}
                    actionLabel={actionLabel}
                    showCheckbox={showCheckbox}
                    checked={rowsCheckboxState.get(row.key)?.subRows.get(subrow.key) ?? false}
                    onCheckboxChange={(checked) => handleSubCheckboxChange(row, subrow, checked)}
                    isPrinting={isPrinting}
                    koulutuksetThatNeedUserVerification={koulutuksetThatNeedUserVerification}
                    verifyKoulutusOsaamiset={verifyKoulutusOsaamiset}
                  />
                ))}
                {onAddNestedRowClick && addNewNestedLabel && (
                  <tr>
                    <td
                      colSpan={5}
                      className={`pt-5 ${categorizedRows.length - 1 === index ? 'pb-7 sm:pb-11' : 'pb-7'}`.trim()}
                    >
                      <Button
                        variant="white"
                        size="sm"
                        label={addNewNestedLabel}
                        onClick={() => onAddNestedRowClick(row)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {uncategorizedRows.length > 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="border-b border-inactive-gray text-body-md pt-6"
                  data-testid="experience-table-uncategorized-title"
                >
                  {t('without-category', { header: mainColumnHeader })}
                </td>
              </tr>
            )}
            {uncategorizedRows.map((row) => (
              <ExperienceTableRow
                key={row.key}
                row={row}
                onRowClick={onRowClick}
                hideOsaamiset={hideOsaamiset}
                osaamisetOdottaaTunnistusta={row.osaamisetOdottaaTunnistusta}
                osaamisetTunnistusEpaonnistui={row.osaamisetTunnistusEpaonnistui}
                rowActionElement={rowActionElement}
                useConfirm={useConfirm}
                confirmTitle={confirmTitle}
                confirmDescription={confirmRowDescription}
                actionLabel={actionLabel}
                showCheckbox={showCheckbox}
              />
            ))}
          </tbody>
        </table>
      )}
      {onAddClick && addNewLabel && (
        <div className="mb-[84px]">
          <Button variant="accent" label={addNewLabel} onClick={onAddClick} testId="experience-table-add" />
        </div>
      )}
    </div>
  );
};
