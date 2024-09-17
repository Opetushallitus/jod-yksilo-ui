import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExperienceTableRow, type ExperienceTableRowData } from './ExperienceTableRow';

interface ExperienceTableProps {
  mainColumnHeader: string;
  rows: ExperienceTableRowData[];
  onRowClick?: (row: ExperienceTableRowData) => void;
}

const SpacerRow = ({ className = 'py-3' }: { className?: string }) => (
  <tr>
    <td colSpan={4} className={className}></td>
  </tr>
);

export const ExperienceTable = ({ mainColumnHeader, rows, onRowClick }: ExperienceTableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const uncategorizedRows = rows.filter((row) => !row.subrows);
  const categorizedRows = rows.filter((row) => row.subrows);

  return (
    <div className="overflow-x-hidden">
      <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr className="border-b border-inactive-gray text-left text-body-md">
            <th scope="col" className="font-normal pb-3">
              {mainColumnHeader}
            </th>
            {sm && (
              <>
                <th scope="col" className="font-normal">
                  {t('started')}
                </th>
                <th scope="col" className="font-normal">
                  {t('ended')}
                </th>
                <th scope="col" className="font-normal">
                  {t('competences')}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <SpacerRow />
          {categorizedRows.map((row) => (
            <React.Fragment key={row.key}>
              <ExperienceTableRow key={row.key} row={row} onRowClick={onRowClick} className="bg-white" />
              {row.subrows?.map((subrow, i) => (
                <ExperienceTableRow
                  key={subrow.key}
                  row={subrow}
                  onRowClick={onRowClick}
                  className={i % 2 !== 0 ? 'bg-white' : 'bg-bg-gray'}
                  nested
                />
              ))}
              <SpacerRow className="py-5" />
            </React.Fragment>
          ))}

          {uncategorizedRows.length > 0 && (
            <tr>
              <td colSpan={4} className="border-b border-inactive-gray text-body-md pt-6">
                {mainColumnHeader} ilman kategoriaa
              </td>
            </tr>
          )}
          {uncategorizedRows.map((row) => (
            <ExperienceTableRow key={row.key} row={row} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
