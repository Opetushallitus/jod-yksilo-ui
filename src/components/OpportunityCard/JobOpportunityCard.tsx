import type { components } from '@/api/schema';
import { NOT_AVAILABLE_LABEL } from '@/constants';
import { getLocalizedText } from '@/utils';
import { JodInfo } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';
import { OpportunityCardWrapper, type OpportunityCardProps } from './OpportunityCard';
import { OpportunityDetail } from './components/OpportunityDetail';
import { OpportunityDetailsWrapper } from './components/OpportunityDetailsWrapper';

type JobOpportunityCardProps = {
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
  ammattiryhma?: components['schemas']['AmmattiryhmaBasicDto'];
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
} & OpportunityCardProps;

export const JobOpportunityCard = ({ ammattiryhmaNimet, ammattiryhma, aineisto, ...rest }: JobOpportunityCardProps) => {
  const { t } = useTranslation();

  return (
    <OpportunityCardWrapper {...rest} type="TYOMAHDOLLISUUS">
      {ammattiryhma ? (
        <OpportunityDetailsWrapper>
          <OpportunityDetail
            title={t('tool.job-opportunity-is-part-of-group')}
            value={
              ammattiryhmaNimet !== undefined && ammattiryhma?.uri
                ? getLocalizedText(ammattiryhmaNimet[ammattiryhma.uri])
                : NOT_AVAILABLE_LABEL
            }
            icon={
              <TooltipWrapper
                tooltipPlacement="top"
                tooltipContent={
                  <div className="text-body-xs max-w-[290px] leading-5">
                    {t('tool.job-opportunity-is-part-of-group-tooltip')}
                  </div>
                }
              >
                <JodInfo size={18} className="text-secondary-5-light-1" />
              </TooltipWrapper>
            }
          />
          <OpportunityDetail
            title={t('tool.job-opportunity-median-salary')}
            value={
              ammattiryhma.mediaaniPalkka
                ? `${ammattiryhma.mediaaniPalkka} ${t('tool.salary-suffix')}`
                : NOT_AVAILABLE_LABEL
            }
            icon={
              <TooltipWrapper
                tooltipPlacement="top"
                tooltipContent={
                  <div className="text-body-xs max-w-[290px] leading-5">
                    {t('tool.job-opportunity-median-salary-tooltip')}
                  </div>
                }
              >
                <JodInfo size={18} className="text-secondary-5-light-1" />
              </TooltipWrapper>
            }
          />
        </OpportunityDetailsWrapper>
      ) : null}
    </OpportunityCardWrapper>
  );
};
