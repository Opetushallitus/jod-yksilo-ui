import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExperienceTableRow, type ExperienceTableRowData } from './ExperienceTableRow';

interface ExperienceTableProps {
  mainColumnHeader: string;
  rows: ExperienceTableRowData[];
  onRowClick?: (row: ExperienceTableRowData) => void;
}

export const ExperienceTable = ({ mainColumnHeader, rows, onRowClick }: ExperienceTableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const uncategorizedRows = rows.filter((row) => !row.subrows);
  const categorizedRows = rows.filter((row) => row.subrows);

  return (
    <div className="overflow-x-hidden">
      <table className="mb-8 w-full text-left" border={0} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr className="border-b-2 border-inactive-gray">
            <th scope="col" className="py-3 pr-5 align-bottom text-form-label font-arial text-secondary-gray">
              {mainColumnHeader}
            </th>
            {sm && (
              <>
                <th scope="col" className="py-3 pr-5 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.started')}
                </th>
                <th scope="col" className="py-3 pr-7 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.ended')}
                </th>
                <th scope="col" className="py-3 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.competences')}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {categorizedRows.map((row, index) => (
            <React.Fragment key={row.key}>
              <ExperienceTableRow key={row.key} row={row} index={index} onRowClick={onRowClick} />
              {row.subrows?.map((tutkinto, index) => (
                <ExperienceTableRow key={tutkinto.key} row={tutkinto} index={index} onRowClick={onRowClick} nested />
              ))}
            </React.Fragment>
          ))}

          {uncategorizedRows.length > 0 && (
            <tr>
              <td
                colSpan={4}
                className="border-b border-inactive-gray py-3 pr-7 align-bottom text-form-label text-secondary-gray pt-6"
              >
                {mainColumnHeader} ilman kategoriaa
              </td>
            </tr>
          )}
          {uncategorizedRows.map((row, index) => (
            <ExperienceTableRow key={row.key} row={row} index={index} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
