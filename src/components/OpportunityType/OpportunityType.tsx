import { components } from '@/api/schema';
import { type MahdollisuusTyyppi } from '@/routes/types';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';

interface OpportunityTypeProps {
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
  showTypeTooltip?: boolean;
}

export const OpportunityType = ({ mahdollisuusTyyppi, aineisto, tyyppi, showTypeTooltip }: OpportunityTypeProps) => {
  const { t } = useTranslation();

  const typeText = React.useMemo(() => {
    if (mahdollisuusTyyppi === 'TYOMAHDOLLISUUS') {
      if (aineisto === 'AMMATTITIETO') {
        return t('opportunity-type.work.AMMATTITIETO');
      } else {
        return t('opportunity-type.work.TMT');
      }
    } else if (mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS') {
      if (tyyppi === 'TUTKINTO') {
        return t('opportunity-type.education.TUTKINTO');
      } else {
        return t('opportunity-type.education.EI_TUTKINTO');
      }
    } else {
      return null;
    }
  }, [tyyppi, t, aineisto, mahdollisuusTyyppi]);

  const typeTooltip = React.useMemo(() => {
    if (mahdollisuusTyyppi === 'TYOMAHDOLLISUUS') {
      const text = {
        TMT: t('opportunity-tooltip.work.TMT'),
        AMMATTITIETO: t('opportunity-tooltip.work.AMMATTITIETO'),
      }[aineisto ?? 'TMT'];

      return (
        <div className="font-arial text-white leading-5 text-card-label">
          <p className="mb-2">{typeText}</p>
          <p className="font-normal">{text}</p>
        </div>
      );
    } else if (mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' && tyyppi) {
      const text = {
        TUTKINTO: t('opportunity-tooltip.education.TUTKINTO'),
        EI_TUTKINTO: t('opportunity-tooltip.education.EI_TUTKINTO'),
      }[tyyppi];

      return (
        <div className="font-arial text-white leading-5 text-card-label">
          <p className="mb-2">{typeText}</p>
          <p className="font-normal">{text}</p>
        </div>
      );
    } else {
      return null;
    }
  }, [tyyppi, aineisto, mahdollisuusTyyppi, t, typeText]);

  return typeText ? (
    <div className="uppercase text-body-xs font-medium text-primary-gray flex items-center gap-2">
      {typeText}
      {showTypeTooltip && (
        <TooltipWrapper tooltipPlacement="top" tooltipContent={typeTooltip}>
          <JodInfo size={18} className="text-secondary-5-light-1" />
        </TooltipWrapper>
      )}
    </div>
  ) : null;
};
