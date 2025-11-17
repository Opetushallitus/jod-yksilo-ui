import type { components } from '@/api/schema';
import { NOT_AVAILABLE_LABEL } from '@/constants';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';
import { OpportunityCardWrapper, type OpportunityCardProps } from './OpportunityCard';
import { OpportunityDetail } from './components/OpportunityDetails';

type EducationOpportunityCardProps = {
  kesto?: components['schemas']['KoulutusmahdollisuusFullDto']['kesto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
  yleisinKoulutusala?: string;
} & OpportunityCardProps;

export const EducationOpportunityCard = ({
  kesto,
  tyyppi,
  yleisinKoulutusala,
  ...rest
}: EducationOpportunityCardProps) => {
  const { t } = useTranslation();

  const duration = React.useMemo(() => {
    if (!kesto?.mediaani || kesto.mediaani === 0) {
      return NOT_AVAILABLE_LABEL;
    }

    return kesto?.mediaani < 12
      ? t('n-months-short', { count: kesto.mediaani })
      : t('n-years', { count: Math.round(kesto.mediaani / 12) });
  }, [kesto?.mediaani, t]);

  const cardTypeTitle =
    tyyppi === 'TUTKINTO' ? t('opportunity-type.education.TUTKINTO') : t('opportunity-type.education.EI_TUTKINTO');

  return (
    <OpportunityCardWrapper
      {...rest}
      type="KOULUTUSMAHDOLLISUUS"
      matchValueBgColorClassName="bg-secondary-2-dark"
      cardTypeTitle={cardTypeTitle}
    >
      <OpportunityDetail
        title={t('tool.education-opportunity-duration')}
        value={duration}
        icon={
          <TooltipWrapper
            tooltipPlacement="top"
            tooltipContent={
              <div className="text-body-xs max-w-[290px] leading-5">
                {t('tool.education-opportunity-duration-tooltip')}
              </div>
            }
          >
            <JodInfo size={18} className="text-secondary-5-light-1" />
          </TooltipWrapper>
        }
      />
      <OpportunityDetail
        title={t('tool.education-opportunity-koulutusala')}
        value={yleisinKoulutusala ?? NOT_AVAILABLE_LABEL}
        icon={
          <TooltipWrapper
            tooltipPlacement="top"
            tooltipContent={
              <div className="text-body-xs max-w-[290px] leading-5">
                {t('tool.education-opportunity-koulutusala-tooltip')}
              </div>
            }
          >
            <JodInfo size={18} className="text-secondary-5-light-1" />
          </TooltipWrapper>
        }
      />
      {rest.children ?? <></>}
    </OpportunityCardWrapper>
  );
};
