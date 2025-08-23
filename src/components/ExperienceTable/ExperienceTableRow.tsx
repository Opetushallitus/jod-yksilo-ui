import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useModal } from '@/hooks/useModal';
import { formatDate, getLocalizedText, sortByProperty } from '@/utils';
import { Checkbox, Spinner, Tag, useMediaQueries } from '@jod/design-system';
import { JodCaretDown, JodCaretUp, JodEdit, JodError } from '@jod/design-system/icons';
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
  last?: boolean;
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
  indeterminate?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}

const Title = ({ nested, row }: { nested?: boolean; row: ExperienceTableRowData }) => {
  const text = getLocalizedText(row?.nimi);

  return nested ? (
    <p className="pl-5 pr-7 pt-2 text-body-sm font-bold sm:font-normal sm:text-body-md sm:py-2 hyphens-auto [overflow-wrap:anywhere]">
      {text}
    </p>
  ) : (
    <p className="pl-5 pr-7 pt-2 text-heading-4 sm:text-heading-3 sm:pt-1 sm:pb-[3px] hyphens-auto [overflow-wrap:anywhere]">
      {text}
    </p>
  );
};

export const ExperienceTableRow = ({
  row,
  nested,
  last = false,
  className,
  onRowClick,
  hideOsaamiset,
  osaamisetOdottaaTunnistusta,
  osaamisetTunnistusEpaonnistui,
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

  const renderCompetencesDetectFailure = () => {
    return (
      <div className="flex justify-start items-center">
        <TooltipWrapper tooltipContent={t('competences-identify-failed')} tooltipPlacement="top">
          <JodError className="text-alert" />
        </TooltipWrapper>
      </div>
    );
  };

  const { showDialog } = useModal();
  const onShowDialog = (onConfirm: () => void) => {
    showDialog({
      title: confirmTitle ?? t('delete'),
      description: confirmDescription ?? '',
      confirmText: t('delete'),
      cancelText: t('cancel'),
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
    onRowClick: (row: ExperienceTableRowData) => void,
    selectedRow: ExperienceTableRowData,
    useConfirm?: boolean,
    rowActionElement?: React.ReactNode,
    actionLabel?: string,
  ) => {
    return (
      <TooltipWrapper
        tooltipPlacement="top"
        tooltipContent={t('competences-identifying')}
        tooltipOpen={osaamisetOdottaaTunnistusta ? undefined : false}
      >
        <button
          aria-label={actionLabel ?? t('edit')}
          onClick={() =>
            useConfirm
              ? onShowDialog(() => {
                  onRowClick(selectedRow);
                })
              : onRowClick(selectedRow)
          }
          className="cursor-pointer flex size-7 items-center justify-center"
          disabled={osaamisetOdottaaTunnistusta}
          title={osaamisetOdottaaTunnistusta ? t('competences-identifying') : undefined}
          type="button"
          data-testid={`experience-row-edit-${selectedRow.key}`}
        >
          {rowActionElement || (
            <JodEdit className={osaamisetOdottaaTunnistusta ? 'text-[#83AED3]' : 'text-secondary-gray'} />
          )}
        </button>
      </TooltipWrapper>
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
        data-testid={`experience-row-checkbox-${row.key}`}
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
    if (onRowClick && row.osaamiset.length > 0) {
      return (
        <button
          aria-expanded={isOpen}
          aria-label={t(isOpen ? 'close' : 'open')}
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer flex gap-x-2 items-center ${sm ? 'text-nowrap pr-2' : 'pr-7'}`}
          data-testid={`experience-row-competences-toggle-${row.key}`}
        >
          {isOpen ? <JodCaretUp /> : <JodCaretDown />}
          {osaamisetCountTotal}
        </button>
      );
    }
    if (!sm) {
      return <span className="pl-[28px] pr-7">{osaamisetCountTotal}</span>;
    }
    return <span className={`text-nowrap pr-2 ${onRowClick ? 'pl-[28px]' : ''}`.trim()}>{osaamisetCountTotal}</span>;
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
      <td className={`text-body-md text-nowrap ${onRowClick ? 'pr-7 pl-[28px]' : 'pr-5'.trim()}`}>
        <span className="pr-2">{osaamisetCountTotal}</span>
      </td>
    ) : (
      <td>
        <span className="text-body-sm text-nowrap pl-[28px] pr-7">{osaamisetCountTotal}</span>
      </td>
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
        {!hideOsaamiset && !sm && <td className="text-nowrap text-body-sm">{renderOsaamisetNestedCell(!sm)}</td>}
        {sm && (
          <>
            <td className="text-body-md pr-7">{!row.hideRowDetails && row.alkuPvm && formatDate(row.alkuPvm)}</td>
            <td className="text-body-md pr-7">{!row.hideRowDetails && row.loppuPvm && formatDate(row.loppuPvm)}</td>
            {!hideOsaamiset && (
              <td className={`text-body-md ${onRowClick ? 'pr-7' : 'pr-5'}`.trim()}>{renderOsaamisetNestedCell(sm)}</td>
            )}
          </>
        )}
        {onRowClick && <td>{rowAction(onRowClick, row, useConfirm, rowActionElement, actionLabel)}</td>}
        {showCheckbox && <td>{renderCheckbox()}</td>}
      </tr>
      <tr>
        {isOpen && !showCheckbox && (
          <td colSpan={5} className={`w-full ${last ? 'px-5 pt-5' : 'p-5'}`.trim()}>
            <div className="flex flex-wrap gap-3" aria-label={t('competences')}>
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
      {!sm && !hideOsaamiset && renderOsaamisetCell(!sm)}
      {sm && (
        <>
          <td className="text-body-md pr-7" colSpan={row.loppuPvm ? 1 : 2}>
            {row.alkuPvm && formatDate(row.alkuPvm)}
          </td>
          {row.loppuPvm && <td className="text-body-md pr-7">{formatDate(row.loppuPvm)}</td>}
          {!hideOsaamiset && renderOsaamisetCell(sm)}
        </>
      )}
      {onRowClick && <td>{rowAction(onRowClick, row, useConfirm, rowActionElement, actionLabel)}</td>}
      {showCheckbox && <td>{renderCheckbox()}</td>}
    </tr>
  );
};
