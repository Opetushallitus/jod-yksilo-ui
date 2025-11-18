import { OsaaminenDto } from '@/api/osaamiset.ts';
import { getLocalizedText } from '@/utils';
import { useTranslation } from 'react-i18next';

export type PlanCompetencesTableRowData = OsaaminenDto & { plans: boolean[] };

interface CompareCompetencesTableRowProps {
  row: PlanCompetencesTableRowData;
  className?: string;
}

export const CompetenceTableRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const { t } = useTranslation();
  // jokaista plania kohden pitäisi tulla yksi td. eli pitää olla lista mukana
  return (
    <tr className={className}>
      <td className="w-full pl-5 pr-7 py-3 text-heading-5 hyphens-auto first-letter:uppercase">
        {getLocalizedText(row.nimi)}
      </td>
      <td className="justify-items-center pr-5"></td>
      {row.plans.map((hasOsaaminen) =>
        hasOsaaminen ? (
          <td className="justify-items-center pr-5">
            <div role="img" aria-label={t('found')} className="size-4 bg-secondary-1 rounded-full" />
            <div aria-hidden className="hidden print:block">
              {t('found')}
            </div>
          </td>
        ) : (
          <td className="justify-items-center pr-5"></td>
        ),
      )}
    </tr>
  );
};
