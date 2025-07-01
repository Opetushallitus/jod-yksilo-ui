import { components } from '@/api/schema';
import { getLocalizedText } from '@/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CompareCompetencesTableRowData {
  uri: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  profiili?: boolean;
}

interface CompareCompetencesTableRowProps {
  row: CompareCompetencesTableRowData;
  className?: string;
}

export const CompareCompetencesTableRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const title = React.useMemo(() => getLocalizedText(row.kuvaus), [row.kuvaus]);
  const { t } = useTranslation();

  return (
    <tr className={className}>
      <td className="w-full pl-5 pr-7 py-3 text-heading-5 hyphens-auto first-letter:uppercase" title={title}>
        {getLocalizedText(row.nimi)}
      </td>

      <td className="justify-items-center pr-5">
        {row.profiili && (
          <div title={title} role="img" aria-label={t('found')} className="size-4 bg-secondary-1 rounded-full" />
        )}
      </td>
    </tr>
  );
};
