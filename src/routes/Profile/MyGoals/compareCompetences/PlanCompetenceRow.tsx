import { useTranslation } from 'react-i18next';

import { cx } from '@jod/design-system';

import { OsaaminenDto } from '@/api/osaamiset.ts';
import { getLocalizedText } from '@/utils';

export type PlanCompetencesTableRowData = OsaaminenDto & { profiili: boolean; plans: boolean[] };

interface CellProps {
  key: string;
  found?: boolean;
  /** Class to color the dot */
  bgClass?: string;
  addBorder?: boolean;
}

const EmptyCell = ({ key, addBorder }: CellProps) => (
  <td
    key={key}
    className={cx('justify-items-center px-3 sm:px-4', { 'border-l border-secondary-gray': addBorder })}
  ></td>
);

const FoundCell = ({ key, bgClass, addBorder }: CellProps) => {
  const { t } = useTranslation();
  return (
    <td
      key={key}
      className={cx('justify-center justify-items-center px-3 sm:px-4', {
        'border-l border-secondary-gray': addBorder,
      })}
    >
      <div role="img" aria-label={t('found')} className={cx('size-4 rounded-full', bgClass)} />
      <div aria-hidden className="hidden print:block">
        {t('found')}
      </div>
    </td>
  );
};

const FoundOrEmptyCell = ({ key, found, bgClass, addBorder }: CellProps) => {
  if (found) {
    return <FoundCell key={key} bgClass={bgClass} addBorder={addBorder} />;
  }
  return <EmptyCell key={key} addBorder={addBorder} />;
};

interface CompareCompetencesTableRowProps {
  row: PlanCompetencesTableRowData;
  className?: string;
}

export const PlanCompetenceRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  return (
    <tr className={className}>
      <td className="w-full py-3 pr-7 pl-5 text-heading-5 hyphens-auto first-letter:uppercase">
        {getLocalizedText(row.nimi)}
      </td>
      <FoundOrEmptyCell key="profile" found={row.profiili} bgClass="bg-secondary-1" />
      {row.plans.map((hasOsaaminen, index) => (
        <FoundOrEmptyCell key={`plan${index}`} found={hasOsaaminen} bgClass="bg-secondary-2" addBorder />
      ))}
    </tr>
  );
};
