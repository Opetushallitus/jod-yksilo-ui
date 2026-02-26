import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useModal } from '@/hooks/useModal';
import { formatDate, getLocalizedText, sortByProperty } from '@/utils';
import { Checkbox, Spinner, Tag, useMediaQueries } from '@jod/design-system';
import { JodCaretDown, JodCaretUp, JodEdit, JodError, JodErrorTriangle } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  osaamisetOdottaaTunnistusta?: boolean;
  osaamisetTunnistusEpaonnistui?: boolean;
}

interface ExperienceTableRowProps {
  row: ExperienceTableRowData;
  nested?: boolean;
  openFromTopLevel?: boolean;
  isOdd?: boolean;
  onRowClick?: (row: ExperienceTableRowData) => void;
  className?: string;
  hideOsaamiset?: boolean;
  osaamisetOdottaaTunnistusta?: boolean;
  osaamisetTunnistusEpaonnistui?: boolean;
  rowActionElement?: React.ReactNode;
  useConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  actionLabel?: string;
  showCheckbox?: boolean;
  checked?: boolean;
  isPrinting?: boolean;
  indeterminate?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  /** Imported koulutukset whose osaamiset needs to be checked by the user */
  koulutuksetThatNeedUserVerification?: string[];
  /** Function to mark the osaamiset of a specific koulutus as verified */
  verifyKoulutusOsaamiset?: (koulutusId: string) => void;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const text = getLocalizedText(row?.nimi);
  const baseClasses = 'pl-3 sm:pl-5 pr-3 sm:pr-7 pt-2 hyphens-auto [overflow-wrap:anywhere]';

  if (nested) {
    return <p className={`${baseClasses} font-normal text-body-md sm:py-2`}>{text}</p>;
  }
  return <p className={`${baseClasses} font-poppins text-heading-4 sm:pt-1 sm:pb-[3px]`}>{text}</p>;
};

const DateRange = ({ alkuPvm, loppuPvm, className = '' }: { alkuPvm?: Date; loppuPvm?: Date; className?: string }) => (
  <div className={className}>
    {alkuPvm && formatDate(alkuPvm)} – {loppuPvm && formatDate(loppuPvm)}
  </div>
);

const CompetencesRow = ({
  tagsVisibleState,
  showCheckbox,
  className,
  t,
  sortedCompetences,
}: {
  tagsVisibleState: boolean;
  showCheckbox?: boolean;
  className?: string;
  t: (key: string) => string;
  sortedCompetences: ExperienceTableRowData['osaamiset'];
}) => (
  <tr>
    {tagsVisibleState && !showCheckbox && (
      <td colSpan={5} className={`${className} w-full max-w-0 px-4 pt-3 pb-5`.trim()}>
        <ul className="flex flex-wrap gap-3" aria-label={t('competences')}>
          {sortedCompetences.map((competence) => (
            <li key={competence.id} className="max-w-full">
              <Tag
                label={getLocalizedText(competence.nimi)}
                tooltip={getLocalizedText(competence.kuvaus)}
                variant="presentation"
                sourceType={competence.sourceType ?? 'jotain-muuta'}
              />
            </li>
          ))}
        </ul>
      </td>
    )}
  </tr>
);

export const ExperienceTableRow = ({
  row,
  nested,
  openFromTopLevel = false,
  isOdd,
  className,
  onRowClick,
  hideOsaamiset,
  osaamisetOdottaaTunnistusta,
  osaamisetTunnistusEpaonnistui,
  rowActionElement,
  useConfirm,
  confirmTitle,
  confirmDescription,
  isPrinting,
  actionLabel,
  showCheckbox,
  checked,
  indeterminate,
  onCheckboxChange,
  koulutuksetThatNeedUserVerification,
  verifyKoulutusOsaamiset,
}: ExperienceTableRowProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const [isOpen, setIsOpen] = React.useState(isPrinting ?? false);
  const tagsVisibleState = isPrinting || isOpen;
  const osaamisetCountTotal = row.osaamiset.length;
  const osaamisetNeedsToBeVerified = koulutuksetThatNeedUserVerification?.includes(row.key);

  const renderCompetencesDetectFailure = () => {
    return (
      <div className="flex justify-start items-center">
        <TooltipWrapper tooltipContent={t('competences-identify-failed')} tooltipPlacement="top">
          <JodErrorTriangle className="text-alert" />
        </TooltipWrapper>
      </div>
    );
  };

  const { showDialog } = useModal();
  const onShowDialog = (onConfirm: () => void) => {
    showDialog({
      title: confirmTitle ?? t('common:delete'),
      description: confirmDescription ?? '',
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      variant: 'destructive',
      onConfirm: () => {
        setTimeout(() => {
          onConfirm();
        });
      },
    });
  };

  const sortedCompetences = React.useMemo(
    () => [...(row.osaamiset ?? [])].sort(sortByProperty(`nimi.${language}`)),
    [row.osaamiset, language],
  );

  const rowAction = (
    onRowClick: ((row: ExperienceTableRowData) => void) | undefined,
    selectedRow: ExperienceTableRowData,
    useConfirm?: boolean,
    rowActionElement?: React.ReactNode,
    actionLabel?: string,
  ) => {
    return onRowClick ? (
      <TooltipWrapper
        tooltipPlacement="top"
        tooltipContent={t('competences-identifying')}
        tooltipOpen={osaamisetOdottaaTunnistusta ? undefined : false}
      >
        <div className="flex justify-end">
          <button
            aria-label={actionLabel ?? t('edit')}
            aria-haspopup="dialog"
            onClick={() =>
              useConfirm
                ? onShowDialog(() => {
                    onRowClick(selectedRow);
                  })
                : onRowClick(selectedRow)
            }
            className={`cursor-pointer flex size-7 items-center justify-center rounded-full mr-2 sm:m-3 ${isOdd ? 'hover:bg-secondary-5-light-3 active:bg-secondary-5-light-3' : 'hover:bg-bg-gray-2 active:bg-bg-gray-2'}`}
            disabled={osaamisetOdottaaTunnistusta}
            title={osaamisetOdottaaTunnistusta ? t('competences-identifying') : undefined}
            type="button"
            data-testid={`experience-row-edit-${selectedRow.key}`}
          >
            {rowActionElement || (
              <JodEdit
                className={osaamisetOdottaaTunnistusta ? 'text-[#83AED3]' : 'text-secondary-gray hover:text-accent'}
              />
            )}
          </button>
        </div>
      </TooltipWrapper>
    ) : null;
  };

  const renderCheckbox = () => {
    return (
      <Checkbox
        className="flex justify-center pr-3 sm:pr-0"
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
        ariaLabel={`${t('choose')} ${row.nimi[language]}`}
        testId={`experience-row-checkbox-${row.key}`}
      />
    );
  };

  const renderOsaamisetNestedCell = (sm: boolean) => {
    if (osaamisetOdottaaTunnistusta) {
      return <Spinner size={24} color="accent" />;
    }
    if (osaamisetTunnistusEpaonnistui && row.osaamiset.length === 0) {
      return renderCompetencesDetectFailure();
    }

    if (row.osaamiset.length > 0) {
      return (
        <button
          type="button"
          aria-expanded={tagsVisibleState}
          onClick={() => {
            if (osaamisetNeedsToBeVerified) {
              verifyKoulutusOsaamiset?.(row.key);
            }
            setIsOpen(!isOpen);
          }}
          className={`cursor-pointer flex gap-x-2 items-center justify-self-end text-secondary-gray ${sm ? 'text-nowrap sm:pr-2' : 'pr-7'} w-full`}
          data-testid={`experience-row-competences-toggle-${row.key}`}
        >
          {osaamisetNeedsToBeVerified && <JodError className="text-secondary-3" />}
          {<span className="ml-auto">{osaamisetCountTotal}</span>}
          {tagsVisibleState ? <JodCaretUp aria-hidden="true" /> : <JodCaretDown aria-hidden="true" />}
        </button>
      );
    }
    if (!sm) {
      return <span className="pl-[28px] pr-7">{osaamisetCountTotal}</span>;
    }
    return (
      <span className="flex gap-x-2 flex-row text-nowrap sm:pr-2 text-secondary-gray justify-end">
        {osaamisetCountTotal}
        <span className="size-6 block"></span>
      </span>
    );
  };

  const renderOsaamisetCell = (sm: boolean) => {
    if (osaamisetOdottaaTunnistusta) {
      return (
        <td className={`text-body-md text-nowrap ${sm ? 'text-center' : ''}`}>
          <Spinner size={24} color="accent" />
        </td>
      );
    }
    if (osaamisetTunnistusEpaonnistui && row.osaamiset.length === 0) {
      return <td className="text-body-md text-nowrap text-center">{renderCompetencesDetectFailure()}</td>;
    }
    return sm ? (
      <td className={`text-body-md text-end text-nowrap ${onRowClick ? 'sm:pr-7 pr-0' : 'pr-5'.trim()}`}>
        <button
          type="button"
          aria-expanded={tagsVisibleState}
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer flex gap-x-2 items-center justify-self-end text-secondary-gray ${sm ? 'text-nowrap sm:pr-2' : 'pr-7'}`}
          data-testid={`experience-row-competences-toggle-${row.key}`}
        >
          <span className="text-secondary-gray">{osaamisetCountTotal}</span>
          <span className="pl-6"></span>
        </button>
      </td>
    ) : (
      <td>
        <span className="text-body-md text-end text-nowrap pl-[28px] pr-7">{osaamisetCountTotal}</span>
      </td>
    );
  };

  const isExpandableRow = nested || openFromTopLevel;
  const commonTextStyles = `pr-7 text-body-md ${!nested ? 'text-secondary-gray' : ''}`;

  if (isExpandableRow) {
    return (
      <>
        <tr key={row.key} className={className}>
          <td className="w-full" colSpan={sm ? 1 : 3}>
            <Title row={row} nested={nested} />
            {!sm && (
              <DateRange
                alkuPvm={row.alkuPvm}
                loppuPvm={row.loppuPvm}
                className={`flex flex-wrap gap-x-5 pb-2 pl-3 sm:pl-5 ${commonTextStyles}`}
              />
            )}
          </td>
          {!hideOsaamiset && !sm && <td className="text-nowrap text-body-md">{renderOsaamisetNestedCell(!sm)}</td>}
          {sm && (
            <>
              <td className={commonTextStyles}>{!row.hideRowDetails && row.alkuPvm && formatDate(row.alkuPvm)}</td>
              <td className={commonTextStyles}>{!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}</td>
              {!hideOsaamiset && (
                <td className={`text-body-md ${onRowClick ? 'pr-7' : 'pr-5'}`.trim()}>
                  {renderOsaamisetNestedCell(sm)}
                </td>
              )}
            </>
          )}
          {onRowClick && <td>{rowAction(onRowClick, row, useConfirm, rowActionElement, actionLabel)}</td>}
          {showCheckbox && <td>{renderCheckbox()}</td>}
        </tr>
        <CompetencesRow
          tagsVisibleState={tagsVisibleState}
          showCheckbox={showCheckbox}
          className={className}
          t={t}
          sortedCompetences={sortedCompetences}
        />
      </>
    );
  }

  return (
    <tr key={row.key} className={className}>
      <td className="w-full" colSpan={sm ? 1 : 3}>
        <Title row={row} />
        {!sm && (
          <DateRange
            alkuPvm={row.alkuPvm}
            loppuPvm={row.loppuPvm}
            className="flex flex-wrap gap-x-5 pb-2 pl-3 sm:pl-5 pr-7 text-secondary-gray text-body-md"
          />
        )}
      </td>
      {!sm && !hideOsaamiset && renderOsaamisetCell(!sm)}
      {sm && (
        <>
          <td className="text-body-md pr-7 text-secondary-gray" colSpan={row.loppuPvm ? 1 : 2}>
            {row.alkuPvm && formatDate(row.alkuPvm)}
          </td>
          {row.loppuPvm && <td className="text-body-md pr-7 text-secondary-gray">{formatDate(row.loppuPvm)}</td>}
          {!hideOsaamiset && renderOsaamisetCell(sm)}
        </>
      )}
      {onRowClick && <td>{rowAction(onRowClick, row, useConfirm, rowActionElement, actionLabel)}</td>}
      {showCheckbox && <td>{renderCheckbox()}</td>}
    </tr>
  );
};
