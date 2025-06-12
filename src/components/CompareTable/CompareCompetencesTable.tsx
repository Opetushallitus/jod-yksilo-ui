import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompareCompetencesTableRow, CompareCompetencesTableRowData } from './CompareCompetencesTableRow';

interface CompareCompetencesTableProps {
  rows: CompareCompetencesTableRowData[];
  className: string;
}

export const CompareCompetencesTable = ({ rows, className }: CompareCompetencesTableProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  const ROW_LIMIT = 10;
  const rowsToRender = showAll ? rows : rows.slice(0, ROW_LIMIT);

  return (
    <div className={`overflow-x-auto font-arial w-full ${className}`.trim()}>
      <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
        <thead className="after:content-[''] after:block after:h-3">
          <tr className="border-b border-inactive-gray text-form-label">
            <th scope="col" className="text-left pl-5 pr-7 pb-3">
              {t('competence')}
            </th>
            <th scope="col" className="text-center whitespace-nowrap pr-5 pb-3">
              {t('your-competences')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowsToRender.map((row) => (
            <CompareCompetencesTableRow key={row.uri} row={row} className="odd:bg-bg-gray-2 even:bg-bg-gray" />
          ))}
        </tbody>
      </table>
      {rows.length > ROW_LIMIT && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-accent text-button-sm sm:text-button-md mt-6 font-poppins cursor-pointer"
        >
          {t('show-all')}
        </button>
      )}
    </div>
  );
};
