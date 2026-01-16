import { cx } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompareCompetencesTableRow, CompareCompetencesTableRowData } from './CompareCompetencesTableRow';

const ROW_LIMIT = 10;

interface CompareCompetencesTableProps {
  rows: CompareCompetencesTableRowData[];
  mode?: 'osaaminen' | 'kiinnostus';
}

export const CompareCompetencesTable = ({ rows, mode = 'osaaminen' }: CompareCompetencesTableProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);

  return (
    <div>
      <table className="font-arial" data-testid="compare-competences-table" aria-label={t('map-competences')}>
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
          {rows.map((row, index) => (
            <CompareCompetencesTableRow
              key={row.uri}
              row={row}
              className={cx('odd:bg-bg-gray-2 even:bg-bg-gray', {
                'hidden print:block': index >= ROW_LIMIT && !showAll,
              })}
            />
          ))}
        </tbody>
      </table>
      {rows.length > ROW_LIMIT && (
        <button
          onClick={() => setShowAll((previous) => !previous)}
          className="text-accent text-button-sm sm:text-button-sm mt-6 sm:px-5 font-poppins cursor-pointer print:hidden"
          data-testid="compare-competences-toggle"
        >
          {showAll ? t('show-less') : t('show-all')}
        </button>
      )}
    </div>
  );
};
