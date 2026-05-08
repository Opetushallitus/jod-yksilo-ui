import { useTranslation } from 'react-i18next';

import { OsaaminenDto } from '@/api/osaamiset.ts';
import { getLocalizedText } from '@/utils';

export type PlanCompetencesTableRowData = OsaaminenDto & { profiili: boolean; plans: boolean[] };

interface CompareCompetencesTableRowProps {
  row: PlanCompetencesTableRowData;
  className?: string;
}

export const PlanCompetenceRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const { t } = useTranslation();
  const emptyCell = (key: string) => <td key={key} className="justify-items-center pr-5"></td>;
  const foundCell = (key: string, bgClass?: string) => (
    <td key={key} className="h-full items-center justify-center">
      <div role="img" aria-label={t('found')} className={`mt-4 size-4 rounded-full ${bgClass ?? ''}`} />
      <div aria-hidden className="hidden print:block">
        {t('found')}
      </div>
    </td>
  );
  const foundOrEmptyCell = (key: string, found: boolean, bgClass?: string) => {
    if (found) {
      return foundCell(key, bgClass);
    }
    return emptyCell(key);
  };
  return (
    <tr className={className}>
      <td className="w-full py-3 pr-7 pl-5 text-heading-5 hyphens-auto first-letter:uppercase">
        {getLocalizedText(row.nimi)}
      </td>
      {foundOrEmptyCell('profile', row.profiili, 'bg-secondary-1')}
      {row.plans.map((hasOsaaminen, index) => foundOrEmptyCell(`plan${index}`, hasOsaaminen, 'bg-secondary-2'))}
    </tr>
  );
};
