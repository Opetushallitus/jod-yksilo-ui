import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompareCompetencesTableRow, CompareCompetencesTableRowData } from './CompareCompetencesTableRow';

interface CompareCompetencesTableProps {
  rows: CompareCompetencesTableRowData[];
  className?: string;
  mode?: 'osaaminen' | 'kiinnostus';
}

export const CompareCompetencesTable = ({ rows, className = '', mode = 'osaaminen' }: CompareCompetencesTableProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  const ROW_LIMIT = 10;
  const rowsToRender = showAll ? rows : rows.slice(0, ROW_LIMIT);

  return (
    <div className={`overflow-x-auto font-arial w-full ${className}`.trim()} data-testid="compare-competences-table">
      <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr className="border-b border-inactive-gray text-form-label">
            <th scope="col" className="text-left pl-5 pr-7 pb-3">
              {t('competence')}
            </th>
            <th scope="col" className="text-center whitespace-nowrap pr-5 pb-3">
              {mode === 'kiinnostus' ? t('your-interests') : t('your-competences')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowsToRender.map((row) => (
            <CompareCompetencesTableRow key={row.uri} row={row} className="odd:bg-bg-gray-2 even:bg-bg-gray" />
          ))}
        </tbody>
      </table>
      {rows.length > ROW_LIMIT && (
        <button
          onClick={() => setShowAll((previous) => !previous)}
          className="text-accent text-button-sm sm:text-button-sm mt-6 sm:px-5 font-poppins cursor-pointer"
          data-testid="compare-competences-toggle"
        >
          {showAll ? t('show-less') : t('show-all')}
        </button>
      )}
    </div>
  );
};
