import { formatDate } from '@/utils';
import { useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

export interface ExperienceTableRowData {
  key: string;
  nimi: Record<string, string>;
  alkuPvm: Date;
  hideRowDetails?: boolean;
  loppuPvm?: Date;
  subrows?: ExperienceTableRowData[];
  osaamisetCount: number;
}

interface ExperienceTableRowProps {
  index: number;
  row: ExperienceTableRowData;
  nested?: boolean;
  onRowClick?: (row: ExperienceTableRowData) => void;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const { i18n } = useTranslation();

  return nested ? (
    <span className="text-body-xs font-arial font-bold text-secondary-gray sm:pt-3">{row.nimi[i18n.language]}</span>
  ) : (
    <span className="pr-5 text-heading-4">{row.nimi[i18n.language]}</span>
  );
};

export const ExperienceTableRow = ({ index, row, nested, onRowClick }: ExperienceTableRowProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const countCompetences = 'work-history.count-competences';

  // CSS class names for non-header cells
  const tdBaseClasses = 'pt-5 text-body-xs font-arial font-bold text-secondary-gray';

  const osaamisetCountTotal =
    row.osaamisetCount > 0
      ? t(countCompetences, { count: row.osaamisetCount })
      : `(${t('work-history.identify-competences')})`;

  if (nested) {
    return (
      <tr key={row.key} className="align-bottom">
        <td className="pl-8 sm:pl-[56px] pr-5">
          {onRowClick ? (
            <button className="bg-none border-none" onClick={() => onRowClick(row)}>
              <Title row={row} nested />
            </button>
          ) : (
            <Title row={row} nested />
          )}
          {!sm && (
            <div className="flex gap-5 pb-2 pt-1 text-body-xs font-arial font-bold text-secondary-gray">
              <p>
                {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
              </p>
              <p>{osaamisetCountTotal}</p>
            </div>
          )}
        </td>
        {sm && (
          <>
            <td className={`pr-5 ${tdBaseClasses}`}>{!row.hideRowDetails && formatDate(row.alkuPvm)}</td>
            <td className={`pr-7 ${tdBaseClasses}`}>
              {!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}
            </td>
            <td className={`w-1/4 ${tdBaseClasses}`}>{osaamisetCountTotal}</td>
          </>
        )}
      </tr>
    );
  } else {
    return (
      <tr key={row.key} className="align-bottom">
        <td className={`pr-5 ${index === 0 ? 'pt-5' : 'pt-6'} align-bottom sm:pt-5`.trim()}>
          <div>
            {onRowClick ? (
              <button className="bg-none border-none" onClick={() => onRowClick(row)}>
                <Title row={row} />
              </button>
            ) : (
              <Title row={row} />
            )}
            {!sm && (
              <div className="flex gap-5 pb-2 pt-1 text-body-xs font-arial font-bold text-secondary-gray">
                <p>
                  {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
                </p>
                <p>{osaamisetCountTotal}</p>
              </div>
            )}
          </div>
        </td>
        {sm && (
          <>
            <td className={`pr-5 ${tdBaseClasses}`} colSpan={row.loppuPvm ? 1 : 2}>
              {formatDate(row.alkuPvm)}
            </td>
            {row.loppuPvm && <td className={`pr-5 ${tdBaseClasses}`}>{formatDate(row.alkuPvm)}</td>}
            <td className={`pr-5 ${tdBaseClasses}`}>{osaamisetCountTotal}</td>
          </>
        )}
      </tr>
    );
  }
};
