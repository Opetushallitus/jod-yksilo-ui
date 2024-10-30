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

const FoundCompetenceDot = ({ className }: { className: string }) => {
  const { t } = useTranslation();
  return <div role="img" aria-label={t('found')} className={`h-5 w-5 rounded-full ${className}`} />;
};

export const CompareCompetencesTableRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const title = React.useMemo(() => getLocalizedText(row.kuvaus), [row.kuvaus]);

  return (
    <tr className={className}>
      <td className="w-full pl-5 pr-7 py-3 text-heading-4 hyphens-auto first-letter:uppercase" title={title}>
        {getLocalizedText(row.nimi)}
      </td>
      <td className="justify-items-center pr-7">
        <FoundCompetenceDot className="bg-secondary-4" />
      </td>
      <td className="justify-items-center pr-5">{row.profiili && <FoundCompetenceDot className="bg-[#333]" />}</td>
    </tr>
  );
};
