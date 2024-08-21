import { EducationRowData } from '@/routes/Profile/EducationHistory/utils';
import { formatDate } from '@/utils';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TableRow {
  key: string;
  hideRowDetails?: boolean;
  hideSubrowDetails?: boolean;
  nimi: Record<string, string>;
  alkuPvm: Date;
  loppuPvm?: Date;
  osaamisetCount: number;
}

interface TableProps {
  selectableColumnHeader: string;
  rows: EducationRowData[];
  onRowClick: (row: EducationRowData) => void;
}

const EducationTable = ({ selectableColumnHeader, rows, onRowClick }: TableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const uncategorizedRows = rows.filter((row) => !row.tutkinnot);
  const categorizedRows = rows.filter((row) => row.tutkinnot);

  return (
    <div className="overflow-x-hidden">
      <table className="mb-8 w-full text-left" border={0} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr className="border-b-2 border-inactive-gray">
            <th scope="col" className="py-3 pr-5 align-bottom text-form-label font-arial text-secondary-gray">
              {selectableColumnHeader}
            </th>
            {sm && (
              <>
                <th scope="col" className="py-3 pr-5 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.started')}
                </th>
                <th scope="col" className="py-3 pr-7 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.ended')}
                </th>
                <th scope="col" className="py-3 align-bottom text-form-label font-arial text-secondary-gray">
                  {t('work-history.competences')}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {categorizedRows.map((row, index) => (
            <React.Fragment key={row.key}>
              <TableRow key={row.key} row={row} index={index} onRowClick={onRowClick} />
              {row.tutkinnot?.map((tutkinto, index) => (
                <TableRow key={tutkinto.key} row={tutkinto} index={index} onRowClick={onRowClick} nested />
              ))}
            </React.Fragment>
          ))}

          {uncategorizedRows.length > 0 && (
            <tr>
              <td
                colSpan={4}
                className="border-b border-inactive-gray py-3 pr-7 align-bottom text-form-label text-secondary-gray pt-6"
              >
                {selectableColumnHeader} ilman kategoriaa
              </td>
            </tr>
          )}
          {uncategorizedRows.map((row, index) => (
            <TableRow key={row.key} row={row} index={index} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableRow = ({
  index,
  row,
  nested,
  onRowClick,
}: {
  index: number;
  row: TableRow;
  nested?: boolean;
  onRowClick: (row: EducationRowData) => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
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
          <button className="bg-none border-none" onClick={() => onRowClick(row)}>
            <span className="text-body-xs font-arial font-bold text-secondary-gray sm:pt-3">{row.nimi[language]}</span>
          </button>
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
            <button className="bg-none border-none" onClick={() => onRowClick(row)}>
              <span className="pr-5 text-heading-4">{row.nimi[language]}</span>
            </button>
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

export default EducationTable;
