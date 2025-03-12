/* eslint-disable sonarjs/cognitive-complexity */
import { formatDate, getLocalizedText, sortByProperty } from '@/utils';
import { Checkbox, ConfirmDialog, Tag, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

export interface ExperienceTableRowData {
  checked?: boolean;
  key: string;
  nimi: Record<string, string>;
  alkuPvm?: Date;
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
  hideOsaamiset?: boolean;
  rowActionElement?: React.ReactNode;
  useConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  actionLabel?: string;
  showCheckbox?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const text = getLocalizedText(row?.nimi);

  return nested ? (
    <p className="pl-5 pr-7 pt-2 text-body-sm font-bold sm:font-normal sm:text-body-md sm:py-2 hyphens-auto">{text}</p>
  ) : (
    <p className="pl-5 pr-7 pt-2 text-heading-4 sm:text-heading-3 sm:pt-1 sm:pb-[3px] hyphens-auto">{text}</p>
  );
};

export const ExperienceTableRow = ({
  row,
  nested,
  last = false,
  className,
  onRowClick,
  hideOsaamiset,
  rowActionElement,
  useConfirm,
  confirmTitle,
  confirmDescription,
  actionLabel,
  showCheckbox,
  checked,
  indeterminate,
  onCheckboxChange,
}: ExperienceTableRowProps) => {
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

  const rowAction = (
    onRowClick: (row: ExperienceTableRowData) => void,
    row: ExperienceTableRowData,
    useConfirm?: boolean,
    rowActionElement?: React.ReactNode,
    confirmTitle?: string,
    confirmDescription?: string,
    actionLabel?: string,
  ) => {
    return (
      <ConfirmDialog
        title={confirmTitle ?? ''}
        onConfirm={() => onRowClick(row)}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="destructive"
        description={confirmDescription ?? ''}
      >
        {(showDialog: () => void) => (
          <button
            aria-label={actionLabel ?? t('edit')}
            onClick={() => {
              if (useConfirm) {
                showDialog();
              } else {
                onRowClick(row);
              }
            }}
            className="cursor-pointer flex size-7 items-center justify-center"
          >
            {rowActionElement || <MdEdit size={24} className="fill-[#006DB3]" />}
          </button>
        )}
      </ConfirmDialog>
    );
  };

  const renderCheckbox = () => {
    return (
      <Checkbox
        name={`checkbox-${row.key}`}
        value={row.key}
        checked={checked ?? row?.checked ?? false}
        indeterminate={indeterminate}
        onChange={(e) => {
          if (onCheckboxChange) {
            onCheckboxChange(e.target.checked);
          } else {
            row.checked = e.target.checked;
            setIsOpen((prev) => !prev); // Ensure state rerenders
          }
        }}
        ariaLabel={t('choose') + ' ' + row.nimi[language]}
        variant="bordered"
      />
    );
  };

  return nested ? (
    <>
      <tr key={row.key} className={className}>
        <td className="w-full">
          <Title row={row} nested />
          {!sm && (
            <div className="flex flex-wrap gap-x-5 pb-2 pl-5 pr-7 text-body-sm">
              {row.alkuPvm && formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
            </div>
          )}
        </td>
        {!hideOsaamiset && !sm && (
          <td className="text-nowrap text-body-sm">
            {onRowClick && row.osaamiset.length > 0 ? (
              <button
                aria-label={t(isOpen ? 'close' : 'open')}
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer flex gap-x-2 items-center pr-7"
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
            <td className="text-body-md pr-7">{!row.hideRowDetails && row.alkuPvm && formatDate(row.alkuPvm)}</td>
            <td className="text-body-md pr-7">{!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}</td>
            {!hideOsaamiset && (
              <td className={`text-body-md ${onRowClick ? 'pr-7' : 'pr-5'}`.trim()}>
                {onRowClick && row.osaamiset.length > 0 ? (
                  <button
                    aria-label={t(isOpen ? 'close' : 'open')}
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex gap-x-2 items-center text-nowrap pr-2"
                  >
                    {isOpen ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                    {osaamisetCountTotal}
                  </button>
                ) : (
                  <span className={`text-nowrap pr-2 ${onRowClick ? 'pl-[28px]' : ''}`.trim()}>
                    {osaamisetCountTotal}
                  </span>
                )}
              </td>
            )}
          </>
        )}
        {onRowClick && (
          <td>
            {rowAction(onRowClick, row, useConfirm, rowActionElement, confirmTitle, confirmDescription, actionLabel)}
          </td>
        )}
        {showCheckbox && <td>{renderCheckbox()}</td>}
      </tr>
      <tr>
        {isOpen && !showCheckbox && (
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
        )}
      </tr>
    </>
  ) : (
    <tr key={row.key} className={className}>
      <td className="w-full">
        <Title row={row} />
        {!sm && (
          <div className="flex flex-wrap gap-x-5 pb-2 pl-5 pr-7 text-body-sm">
            <span>
              {row.alkuPvm && formatDate(row.alkuPvm)} – {row.loppuPvm && formatDate(row.loppuPvm)}
            </span>
          </div>
        )}
      </td>
      {!hideOsaamiset && !sm && (
        <td>
          <span className="text-body-sm text-nowrap pl-[28px] pr-7">{osaamisetCountTotal}</span>
        </td>
      )}
      {sm && (
        <>
          <td className="text-body-md pr-7" colSpan={row.loppuPvm ? 1 : 2}>
            {row.alkuPvm && formatDate(row.alkuPvm)}
          </td>
          {row.loppuPvm && <td className="text-body-md pr-7">{formatDate(row.loppuPvm)}</td>}
          {!hideOsaamiset && (
            <td className={`text-body-md text-nowrap ${onRowClick ? 'pr-7 pl-[28px]' : 'pr-5'.trim()}`}>
              <span className="pr-2">{osaamisetCountTotal}</span>
            </td>
          )}
        </>
      )}
      {onRowClick && (
        <td>
          {rowAction(onRowClick, row, useConfirm, rowActionElement, confirmTitle, confirmDescription, actionLabel)}
        </td>
      )}
      {showCheckbox && <td>{renderCheckbox()}</td>}
    </tr>
  );
};
