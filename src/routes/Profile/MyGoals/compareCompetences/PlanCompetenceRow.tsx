import { OsaaminenDto } from '@/api/osaamiset.ts';
import { getLocalizedText } from '@/utils';
import { useTranslation } from 'react-i18next';

export type PlanCompetencesTableRowData = OsaaminenDto & { profiili: boolean; plans: boolean[] };

interface CompareCompetencesTableRowProps {
  row: PlanCompetencesTableRowData;
  className?: string;
}

export const PlanCompetenceRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const { t } = useTranslation();
  const emptyCell = <td className="justify-items-center pr-5"></td>;
  const foundCell = (bgClass?: string) => (
    <td className=" justify-center items-center h-full">
      <div role="img" aria-label={t('found')} className={`size-4 rounded-full mt-4 ${bgClass ?? ''}`} />
      <div aria-hidden className="hidden print:block">
        {t('found')}
      </div>
    </td>
  );
  const foundOrEmptyCell = (found: boolean, bgClass?: string) => {
    if (found) {
      return foundCell(bgClass);
    }
    return emptyCell;
  };
  return (
    <tr className={className}>
      <td className="w-full pl-5 pr-7 py-3 text-heading-5 hyphens-auto first-letter:uppercase">
        {getLocalizedText(row.nimi)}
      </td>
      {foundOrEmptyCell(row.profiili, 'bg-secondary-1')}
      {row.plans.map((hasOsaaminen) => foundOrEmptyCell(hasOsaaminen, 'bg-secondary-2'))}
    </tr>
  );
};
