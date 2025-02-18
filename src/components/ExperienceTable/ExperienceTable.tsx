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
}: ExperienceTableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const uncategorizedRows = rows.filter((row) => !row.subrows);
  const categorizedRows = rows.filter((row) => row.subrows);

  return (
    <div className="overflow-x-auto pl-3 pt-3">
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
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {categorizedRows.map((row, index) => (
              <React.Fragment key={row.key}>
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
                  {mainColumnHeader} ilman kategoriaa
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
