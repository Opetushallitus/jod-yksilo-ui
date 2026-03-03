import type { MahdollisuusAlityyppi } from '@/routes/types';
import { JodInfo, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';

interface OpportunityTypeProps {
  mahdollisuusAlityyppi: MahdollisuusAlityyppi;
  showTypeTooltip?: boolean;
}

export const OpportunityType = ({ mahdollisuusAlityyppi, showTypeTooltip }: OpportunityTypeProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const getAmmattitietoUrl = React.useCallback(() => {
    switch (language) {
      case 'sv':
        return 'https://tyomarkkinatori.fi/sv/yrkesinfo';
      case 'en':
        return 'https://tyomarkkinatori.fi/en/professional-information';
      default:
        return 'https://tyomarkkinatori.fi/henkiloasiakkaat/ammattitieto';
    }
  }, [language]);

  const typeText = React.useMemo(() => {
    switch (mahdollisuusAlityyppi) {
      case 'AMMATTI':
        return t('opportunity-type.work.AMMATTITIETO');
      case 'MUU_TYOMAHDOLLISUUS':
        return t('opportunity-type.work.TMT');
      case 'TUTKINTO':
        return t('opportunity-type.education.TUTKINTO');
      case 'MUU_KOULUTUS':
        return t('opportunity-type.education.EI_TUTKINTO');
    }
  }, [mahdollisuusAlityyppi, t]);

  const tooltipText = React.useMemo(() => {
    switch (mahdollisuusAlityyppi) {
      case 'AMMATTI':
        return (
          <Trans
            i18nKey="opportunity-tooltip.work.AMMATTITIETO"
            components={{
              Icon: <JodOpenInNew ariaLabel={t('common:external-link')} size={18} />,
              CustomLink: (
                <Link
                  to={getAmmattitietoUrl()}
                  className="inline-flex underline items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        );
      case 'MUU_TYOMAHDOLLISUUS':
        return <>{t('opportunity-tooltip.work.TMT')}</>;
      case 'TUTKINTO':
        return <>{t('opportunity-tooltip.education.TUTKINTO')}</>;
      case 'MUU_KOULUTUS':
        return <>{t('opportunity-tooltip.education.EI_TUTKINTO')}</>;
    }
  }, [mahdollisuusAlityyppi, getAmmattitietoUrl, t]);

  const typeTooltip = React.useMemo(() => {
    return (
      <div className="font-arial text-white leading-5 text-card-label">
        <p className="mb-2">{typeText}</p>
        <p className="font-normal">{tooltipText}</p>
      </div>
    );
  }, [typeText, tooltipText]);

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
