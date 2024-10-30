import { components } from '@/api/schema';
import { getLocalizedText } from '@/utils';
import { useTranslation } from 'react-i18next';
import { CompareCompetencesTableRow, CompareCompetencesTableRowData } from './CompareCompetencesTableRow';

interface CompareCompetencesTableProps {
  rows: CompareCompetencesTableRowData[];
  opportunityName?: components['schemas']['LokalisoituTeksti'];
  className: string;
}

export const CompareCompetencesTable = ({ rows, opportunityName, className }: CompareCompetencesTableProps) => {
  const { t } = useTranslation();

  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
        <thead className="after:content-[''] after:block after:h-5">
          <tr className="text-body-md border-b border-inactive-gray">
            <th scope="col" className="text-left font-normal pl-5 pr-7 pb-3">
              {t('competence')}
            </th>
            <th scope="col" className="text-center font-normal whitespace-nowrap pr-7 pb-3">
              {getLocalizedText(opportunityName)}
            </th>
            <th scope="col" className="text-center font-normal whitespace-nowrap pr-5 pb-3">
              {t('your-competences')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <CompareCompetencesTableRow
              key={row.uri}
              row={row}
              className={index % 2 === 0 ? 'bg-white bg-opacity-60' : 'bg-bg-gray'}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
