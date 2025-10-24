import type { components } from '@/api/schema';
import { getLocalizedText } from '@/utils';
import { JodInfo } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';
import { OpportunityCard, type OpportunityCardProps } from './OpportunityCard';
import { OpportunityDetail } from './components/OpportunityDetails';

type JobOpportunityCardProps = {
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
  ammattiryhma?: components['schemas']['AmmattiryhmaBasicDto'];
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
} & OpportunityCardProps;

export const JobOpportunityCard = ({ ammattiryhmaNimet, ammattiryhma, aineisto, ...rest }: JobOpportunityCardProps) => {
  const { t } = useTranslation();

  return (
    <OpportunityCard
      {...rest}
      type="TYOMAHDOLLISUUS"
      matchValueBgColorClassName="bg-[#AD4298]"
      cardTypeTitle={t(`opportunity-type.work.${aineisto || 'TMT'}`)}
    >
      {ammattiryhma ? (
        <>
          <OpportunityDetail
            title={t('tool.job-opportunity-is-part-of-group')}
            value={
              ammattiryhmaNimet !== undefined && ammattiryhma?.uri
                ? getLocalizedText(ammattiryhmaNimet[ammattiryhma.uri])
                : '---'
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
                <JodInfo size={18} className="text-[#999]" />
              </TooltipWrapper>
            }
          />
          <OpportunityDetail
            title={t('tool.job-opportunity-median-salary')}
            value={ammattiryhma.mediaaniPalkka ? `${ammattiryhma.mediaaniPalkka} ${t('tool.salary-suffix')}` : '---'}
            icon={
              <TooltipWrapper
                tooltipPlacement="top"
                tooltipContent={
                  <div className="text-body-xs max-w-[290px] leading-5">
                    {t('tool.job-opportunity-median-salary-tooltip')}
                  </div>
                }
              >
                <JodInfo size={18} className="text-[#999]" />
              </TooltipWrapper>
            }
          />
        </>
      ) : null}
    </OpportunityCard>
  );
};
