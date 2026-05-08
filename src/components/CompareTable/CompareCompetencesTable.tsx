import React from 'react';
import { useTranslation } from 'react-i18next';

import { cx } from '@jod/design-system';

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
            <th scope="col" className="pr-7 pb-3 pl-5 text-left">
              {t('competence')}
            </th>
            <th scope="col" className="pr-5 pb-3 text-center whitespace-nowrap">
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
          className="mt-6 cursor-pointer font-poppins text-button-sm text-accent sm:px-5 sm:text-button-sm print:hidden"
          data-testid="compare-competences-toggle"
        >
          {showAll ? t('show-less') : t('common:show-all')}
        </button>
      )}
    </div>
  );
};
