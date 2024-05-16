/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/cognitive-complexity */
import { useTranslation } from 'react-i18next';
import { Checkbox, useMediaQueries } from '@jod/design-system';
import { formatDate } from '../utils';

export interface WorkHistoryTableRow {
  key: string;
  tyopaikkaId?: string;
  toimenkuvatCount: number;
  checked?: boolean;
  nimi: Record<string, string>;
  alkuPvm: Date;
  loppuPvm?: Date;
  osaamisetCount: number;
}

interface WorkHistoryTableProps {
  rows: WorkHistoryTableRow[];
  setRows?: (rows: WorkHistoryTableRow[]) => void;
}

export const WorkHistoryTable = ({ rows, setRows }: WorkHistoryTableProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const setRow = setRows
    ? (row: WorkHistoryTableRow) => {
        setRows(
          rows.map((r) => {
            if (r.key === row.key) {
              return row;
            }
            return r;
          }),
        );
      }
    : undefined;

  return (
    <div className="overflow-x-hidden">
      <table className="mb-8 w-full text-left" border={0} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr className="border-b-2 border-inactive-gray">
            <th scope="col" colSpan={2} className="py-3 pr-5 align-bottom text-heading-5 text-secondary-gray">
              {t('work-history.workplace-or-job-description')}
            </th>
            {sm && (
              <>
                <th scope="col" className="py-3 pr-5 align-bottom text-form-label text-secondary-gray">
                  {t('work-history.started')}
                </th>
                <th scope="col" className="py-3 pr-7 align-bottom text-form-label text-secondary-gray">
                  {t('work-history.ended')}
                </th>
                <th scope="col" className="py-3 align-bottom text-form-label text-secondary-gray">
                  {t('work-history.competences')}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <WorkHistoryTableRow key={row.key} row={row} setRow={setRow} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WorkHistoryTableRow = ({
  index,
  row,
  setRow,
}: {
  index: number;
  row: WorkHistoryTableRow;
  setRow?: (rows: WorkHistoryTableRow) => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const osaamisetCountTotal =
    row.osaamisetCount > 0
      ? t('work-history.count-competences', { count: row.osaamisetCount })
      : `(${t('work-history.identify-competences')})`;

  return (
    <tr key={row.key} className="align-bottom">
      {row.checked !== undefined ? (
        <>
          <td
            className={`${setRow ? 'sm:pl-5' : ''} pr-5 ${index === 0 ? 'pt-5' : 'pt-6'} align-bottom sm:pt-5`.trim()}
            colSpan={2}
          >
            {setRow ? (
              <>
                <Checkbox
                  name="tyopaikka"
                  label={<span className="pl-5 text-heading-4">{row.nimi[language]}</span>}
                  ariaLabel={row.nimi[language]}
                  value={row.nimi[language]}
                  checked={row.checked}
                  onChange={() => setRow && setRow({ ...row, checked: !row.checked })}
                  className="items-end"
                />
                {!sm && (
                  <div className="flex gap-5 pb-2 pl-8 pt-1 text-body-xs font-bold text-secondary-gray">
                    <p>
                      {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
                    </p>
                    <p>{osaamisetCountTotal}</p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <span className="pr-5 text-heading-4">{row.nimi[language]}</span>
                {!sm && (
                  <div className="flex gap-5 pb-2 pt-1 text-body-xs font-bold text-secondary-gray">
                    <p>
                      {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
                    </p>
                    <p>{osaamisetCountTotal}</p>
                  </div>
                )}
              </div>
            )}
          </td>
          {sm && (
            <>
              <td className={`pr-5 pt-5 text-body-xs font-bold text-secondary-gray`}>{formatDate(row.alkuPvm)}</td>
              <td className={`pr-7 pt-5 text-body-xs font-bold text-secondary-gray`}>
                {row.loppuPvm && formatDate(row.loppuPvm)}
              </td>
              <td className={`w-1/4 pt-5 text-body-xs font-bold text-secondary-gray`}>{osaamisetCountTotal}</td>
            </>
          )}
        </>
      ) : (
        <>
          <td
            colSpan={2}
            className={`${setRow ? 'pl-8 sm:pl-[56px]' : ''} pr-5 pt-1 text-body-xs font-bold text-accent sm:pt-3`.trim()}
          >
            {sm ? row.nimi[language] : <p className="pt-3">{row.nimi[language]}</p>}
            {!sm && (
              <div className="flex gap-5 pt-1">
                <p>
                  {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
                </p>
                <p>{t('work-history.count-competences', { count: row.osaamisetCount })}</p>
              </div>
            )}
          </td>
          {sm && (
            <>
              <td className="pr-5 pt-3 text-body-xs font-bold text-secondary-gray">
                {row.toimenkuvatCount > 1 ? formatDate(row.alkuPvm) : ''}
              </td>
              <td className="pr-7 pt-3 text-body-xs font-bold text-secondary-gray">
                {row.toimenkuvatCount > 1 ? row.loppuPvm && formatDate(row.loppuPvm) : ''}
              </td>
              <td className="pt-3 text-body-xs font-bold text-secondary-gray">
                {row.toimenkuvatCount > 1 && row.osaamisetCount > 0
                  ? t('work-history.count-competences', { count: row.osaamisetCount })
                  : ''}
              </td>
            </>
          )}
        </>
      )}
    </tr>
  );
};
