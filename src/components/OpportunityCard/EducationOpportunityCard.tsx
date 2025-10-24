import type { components } from '@/api/schema';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';
import { OpportunityCard, type OpportunityCardProps } from './OpportunityCard';
import { OpportunityDetail } from './components/OpportunityDetails';

type EducationOpportunityCardProps = {
  kesto?: components['schemas']['KoulutusmahdollisuusFullDto']['kesto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
  yleisinKoulutusala?: string; // Code
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
      return '---';
    }

    return kesto?.mediaani < 12
      ? t('n-months', { count: kesto.mediaani })
      : t('n-years', { count: Math.round(kesto.mediaani / 12) });
  }, [kesto?.mediaani, t]);

  return (
    <OpportunityCard
      {...rest}
      type="KOULUTUSMAHDOLLISUUS"
      matchValueBgColorClassName="bg-[#00818A]"
      cardTypeTitle={t(`opportunity-type.education.${tyyppi || 'EI_TUTKINTO'}`)}
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
            <JodInfo size={18} className="text-[#999]" />
          </TooltipWrapper>
        }
      />
      <OpportunityDetail
        title={t('tool.education-opportunity-koulutusala')}
        value={yleisinKoulutusala ?? '---'}
        icon={
          <TooltipWrapper
            tooltipPlacement="top"
            tooltipContent={
              <div className="text-body-xs max-w-[290px] leading-5">
                {t('tool.education-opportunity-koulutusala-tooltip')}
              </div>
            }
          >
            <JodInfo size={18} className="text-[#999]" />
          </TooltipWrapper>
        }
      />
    </OpportunityCard>
  );
};
