import { useTranslation } from 'react-i18next';

import { components } from '@/api/schema';
import { useEnvironment } from '@/hooks/useEnvironment';
import { getLocalizedText } from '@/utils';

import { TooltipWrapper } from '../Tooltip/TooltipWrapper';

export interface CompareCompetencesTableRowData {
  uri: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  profiili?: boolean;
  esiintyvyys?: number;
}

interface CompareCompetencesTableRowProps {
  row: CompareCompetencesTableRowData;
  className?: string;
}

const WrapWithTooltipIfDev = ({
  children,
  tooltipContent,
}: {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
}) => {
  const { isDev } = useEnvironment();
  if (isDev) {
    return (
      <TooltipWrapper tooltipContent={tooltipContent}>
        <span>{children}</span>
      </TooltipWrapper>
    );
  }
  return <>{children}</>;
};

export const CompareCompetencesTableRow = ({ row, className }: CompareCompetencesTableRowProps) => {
  const { t } = useTranslation();
  return (
    <tr className={className}>
      <td className="w-full py-3 pr-7 pl-5 text-heading-5 hyphens-auto first-letter:uppercase">
        <WrapWithTooltipIfDev tooltipContent={row.esiintyvyys}>{getLocalizedText(row.nimi)}</WrapWithTooltipIfDev>
      </td>

      <td className="justify-items-center pr-5">
        {row.profiili && (
          <>
            <div role="img" aria-label={t('found')} className="size-4 rounded-full bg-primary-1" />
            <div aria-hidden className="hidden print:block">
              {t('found')}
            </div>
          </>
        )}
      </td>
    </tr>
  );
};
