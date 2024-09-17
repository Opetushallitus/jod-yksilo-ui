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
  row: ExperienceTableRowData;
  nested?: boolean;
  onRowClick?: (row: ExperienceTableRowData) => void;
  className?: string;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const { i18n } = useTranslation();

  return nested ? (
    <span className="px-5 text-black text-body-sm sm:pt-3 font-bold sm:font-normal sm:text-body-md">
      {row.nimi[i18n.language]}
    </span>
  ) : (
    <span className="px-5 text-heading-4 sm:text-heading-3">{row.nimi[i18n.language]}</span>
  );
};

export const ExperienceTableRow = ({ row, nested, className, onRowClick }: ExperienceTableRowProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  // CSS class names for non-header cells
  const tdBaseClasses = 'text-body-md text-black py-2';

  const osaamisetCountTotal =
    row.osaamisetCount > 0 ? t('count-competences', { count: row.osaamisetCount }) : t('no-competences');

  if (nested) {
    return (
      <tr key={row.key} className={className}>
        <td>
          {onRowClick ? (
            <button className="bg-none border-none" onClick={() => onRowClick(row)}>
              <Title row={row} nested />
            </button>
          ) : (
            <Title row={row} nested />
          )}
          {!sm && (
            <div className="flex gap-5 pb-2 pt-1 px-5 text-body-sm">
              <p>
                {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
              </p>
              <p>{osaamisetCountTotal}</p>
            </div>
          )}
        </td>
        {sm && (
          <>
            <td className={tdBaseClasses}>{!row.hideRowDetails && formatDate(row.alkuPvm)}</td>
            <td className={tdBaseClasses}>{!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}</td>
            <td className={tdBaseClasses}>{osaamisetCountTotal}</td>
          </>
        )}
      </tr>
    );
  } else {
    return (
      <tr key={row.key} className={className}>
        <td>
          <div>
            {onRowClick ? (
              <button className="bg-none border-none" onClick={() => onRowClick(row)}>
                <Title row={row} />
              </button>
            ) : (
              <Title row={row} />
            )}
            {!sm && (
              <div className="flex gap-5 pb-2 pt-1 text-body-sm px-5 text-black">
                <span>
                  {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
                </span>
                <span>{osaamisetCountTotal}</span>
              </div>
            )}
          </div>
        </td>
        {sm && (
          <>
            <td className={tdBaseClasses} colSpan={row.loppuPvm ? 1 : 2}>
              {formatDate(row.alkuPvm)}
            </td>
            {row.loppuPvm && <td className={tdBaseClasses}>{formatDate(row.loppuPvm)}</td>}
            <td className={tdBaseClasses}>{osaamisetCountTotal}</td>
          </>
        )}
      </tr>
    );
  }
};
