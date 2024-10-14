/* eslint-disable sonarjs/cognitive-complexity */
import { formatDate, getLocalizedText, sortByProperty } from '@/utils';
import { Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

export interface ExperienceTableRowData {
  key: string;
  nimi: Record<string, string>;
  alkuPvm: Date;
  hideRowDetails?: boolean;
  loppuPvm?: Date;
  subrows?: ExperienceTableRowData[];
  osaamiset: {
    id: string;
    nimi: Record<string, string>;
    kuvaus: Record<string, string>;
    sourceType: 'tyopaikka' | 'koulutus' | 'vapaa-ajan-toiminto';
  }[];
}

interface ExperienceTableRowProps {
  row: ExperienceTableRowData;
  nested?: boolean;
  last?: boolean;
  onRowClick?: (row: ExperienceTableRowData) => void;
  className?: string;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const { i18n } = useTranslation();

  return nested ? (
    <p className="pl-5 pr-7 pt-2 text-body-sm font-bold sm:font-normal sm:text-body-md sm:py-2">
      {row.nimi[i18n.language]}
    </p>
  ) : (
    <p className="pl-5 pr-7 pt-2 text-heading-4 sm:text-heading-3 sm:pt-1 sm:pb-[3px]">{row.nimi[i18n.language]}</p>
  );
};

export const ExperienceTableRow = ({ row, nested, last = false, className, onRowClick }: ExperienceTableRowProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const [isOpen, setIsOpen] = React.useState(false);

  const osaamisetCountTotal =
    row.osaamiset.length > 0 ? t('count-competences', { count: row.osaamiset.length }) : t('no-competences');

  const sortedCompetences = React.useMemo(
    () => [...(row.osaamiset ?? [])].sort(sortByProperty(`nimi.${language}`)),
    [row.osaamiset, language],
  );

  return nested ? (
    <>
      <tr key={row.key} className={className}>
        <td className="w-full">
          <Title row={row} nested />
          {!sm && (
            <div className="flex flex-wrap gap-x-5 pb-2 pl-5 pr-7 text-body-sm">
              {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
            </div>
          )}
        </td>
        {!sm && (
          <td className="text-nowrap text-body-sm">
            {onRowClick && row.osaamiset.length > 0 ? (
              <button
                aria-label={t(isOpen ? 'close' : 'open')}
                onClick={() => setIsOpen(!isOpen)}
                className="flex gap-x-2 items-center pr-7"
              >
                {isOpen ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                {osaamisetCountTotal}
              </button>
            ) : (
              <span className="pl-[28px] pr-7">{osaamisetCountTotal}</span>
            )}
          </td>
        )}
        {sm && (
          <>
            <td className="text-body-md pr-7">{!row.hideRowDetails && formatDate(row.alkuPvm)}</td>
            <td className="text-body-md pr-7">{!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}</td>
            <td className={`text-body-md ${onRowClick ? 'pr-7' : 'pr-5'}`.trim()}>
              {onRowClick && row.osaamiset.length > 0 ? (
                <button
                  aria-label={t(isOpen ? 'close' : 'open')}
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex gap-x-2 items-center text-nowrap"
                >
                  {isOpen ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                  {osaamisetCountTotal}
                </button>
              ) : (
                <span className={`text-nowrap ${onRowClick ? 'pl-[28px]' : ''}`.trim()}>{osaamisetCountTotal}</span>
              )}
            </td>
          </>
        )}
        {onRowClick && (
          <td>
            <button
              aria-label={t('edit')}
              onClick={() => onRowClick(row)}
              className="flex size-7 items-center justify-center"
            >
              <MdEdit size={24} className="fill-[#006DB3]" />
            </button>
          </td>
        )}
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={5} className={`w-full ${last ? 'px-5 pt-5' : 'p-5'}`.trim()}>
            <div className="flex flex-wrap gap-3">
              {sortedCompetences.map((competence) => (
                <Tag
                  label={getLocalizedText(competence.nimi)}
                  title={getLocalizedText(competence.kuvaus)}
                  key={competence.id}
                  variant="presentation"
                  sourceType={competence.sourceType ?? 'jotain-muuta'}
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  ) : (
    <tr key={row.key} className={className}>
      <td className="w-full">
        <Title row={row} />
        {!sm && (
          <div className="flex flex-wrap gap-x-5 pb-2 pl-5 pr-7 text-body-sm">
            <span>
              {formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
            </span>
          </div>
        )}
      </td>
      {!sm && (
        <td>
          <span className="text-body-sm text-nowrap pl-[28px] pr-7">{osaamisetCountTotal}</span>
        </td>
      )}
      {sm && (
        <>
          <td className="text-body-md pr-7" colSpan={row.loppuPvm ? 1 : 2}>
            {formatDate(row.alkuPvm)}
          </td>
          {row.loppuPvm && <td className="text-body-md pr-7">{formatDate(row.loppuPvm)}</td>}
          <td className={`text-body-md text-nowrap ${onRowClick ? 'pr-7 pl-[28px]' : 'pr-5'.trim()}`}>
            {osaamisetCountTotal}
          </td>
        </>
      )}
      {onRowClick && (
        <td>
          <button
            aria-label={t('edit')}
            onClick={() => onRowClick(row)}
            className="flex size-7 items-center justify-center"
          >
            <MdEdit size={24} className="fill-[#006DB3]" />
          </button>
        </td>
      )}
    </tr>
  );
};
