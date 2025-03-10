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
        checked: row.checked ?? allSubRowsChecked,
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
    <div className="overflow-x-auto p-3">
      {rows.length > 0 && (
        <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
          <thead className="after:content-[''] after:block after:h-5">
            <tr className="border-b border-inactive-gray text-left text-body-md font-normal">
              <th scope="col" className="pr-7 pb-3">
                {mainColumnHeader}
              </th>
              {sm && (
                <>
                  <th scope="col" className="pr-7 pb-3">
                    {t('started')}
                  </th>
                  <th scope="col" className="pr-7 pb-3">
                    {t('ended')}
                  </th>
                  {!hideOsaamiset && (
                    <th scope="col" className={`pb-3 ${onNestedRowClick ? 'pr-7' : 'pr-5'}`.trim()}>
                      {t('competences')}
                    </th>
                  )}
                  {showCheckbox && (
                    <th scope="col" className="pr-5 pb-3">
                      {checkboxColumnHeader}
                    </th>
                  )}
                </>
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
                  key={row.key}
                  row={row}
                  onRowClick={onRowClick}
                  className="bg-white border-spacing-x-2"
                  hideOsaamiset={hideOsaamiset}
                  rowActionElement={rowActionElement}
                  useConfirm={useConfirm}
                  confirmTitle={confirmTitle}
                  confirmDescription={confirmRowDescription}
                  actionLabel={actionLabel}
                  showCheckbox={showCheckbox}
                  checked={rowsCheckboxState.get(row.key)?.checked ?? false}
                  indeterminate={rowsCheckboxState.get(row.key)?.indeterminate ?? false}
                  onCheckboxChange={(checked) => handleParentCheckboxChange(row, checked)}
                />
                {row.subrows?.map((subrow, i) => (
                  <ExperienceTableRow
                    key={subrow.key}
                    row={subrow}
                    last={i === row.subrows!.length - 1}
                    onRowClick={onNestedRowClick}
                    className={i % 2 !== 0 ? 'bg-white bg-opacity-60' : 'bg-bg-gray'}
                    nested
                    hideOsaamiset={hideOsaamiset}
                    rowActionElement={rowActionElement}
                    useConfirm={useConfirm}
                    confirmTitle={confirmTitle}
                    confirmDescription={confirmSubRowDescription}
                    actionLabel={actionLabel}
                    showCheckbox={showCheckbox}
                    checked={rowsCheckboxState.get(row.key)?.subRows.get(subrow.key) ?? false}
                    onCheckboxChange={(checked) => handleSubCheckboxChange(row, subrow, checked)}
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
                <td colSpan={5} className="border-b border-inactive-gray text-body-md pt-6">
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
          <Button variant="white" label={addNewLabel} onClick={onAddClick} />
        </div>
      )}
    </div>
  );
};
