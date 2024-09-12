import { components } from '@/api/schema';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiTrendingDown, HiTrendingUp } from 'react-icons/hi';
import { MdBlock } from 'react-icons/md';

type CardType = 'work' | 'education';
interface OpportunityCardProps {
  name: string;
  description: string;
  matchValue?: number;
  matchLabel: string;
  type: CardType;
  trend: components['schemas']['EhdotusMetadata']['trendi'];
  employmentOutlook: number;
  hasRestrictions: boolean;
  industryName?: string;
  mostCommonEducationBackground?: string;
  selected: boolean;
  toggleSelection: () => void;
}

const bgForType = (type: CardType) => {
  if (type === 'work') {
    return 'bg-[#AD4298]';
  }
  return 'bg-[#00818A]';
};

const Match = ({ match, label, bg }: { match?: number; label: string; bg: string }) => {
  return (
    <div
      className={`${bg} flex flex-row shrink-0 sm:flex-col rounded-lg sm:rounded-[40px] sm:min-h-[80px] w-[132px] sm:w-[80px] h-[32px] text-white justify-center text-center items-center`}
    >
      {match && (
        <>
          <span className="mr-3 sm:mr-0 font-semibold text-[22px] sm:text-[24px]">{Math.round(match * 100)}%</span>
          <span className="flex justify-center text-[12px] leading-[16px] font-arial font-bold">{label}</span>
        </>
      )}
    </div>
  );
};

const BottomBox = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="font-arial border border-inactive-gray py-2 px-3 -mr-[1px] -mb-[1px] text-[12px] leading-[20px] flex flex-row items-center gap-2">
    <span className="flex items-center mr-1">{title}</span>
    <span className="flex items-center">{children}</span>
  </div>
);

const OutlookDots = ({ outlook, ariaLabel }: { outlook: number; ariaLabel: string }) => (
  <div className="flex flex-row gap-2" aria-label={ariaLabel}>
    {Array.from({ length: outlook }).map((_, idx) => (
      <div key={idx} className={`${idx < outlook ? 'bg-accent' : 'bg-accent-25'} w-4 h-4 rounded-full`} aria-hidden />
    ))}
  </div>
);

const SelectedCheckbox = ({
  selected,
  toggleSelection,
  name,
}: {
  selected: boolean;
  toggleSelection: () => void;
  name: string;
}) => {
  const { t } = useTranslation();

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSelection();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      toggleSelection();
    }
  };

  return (
    <span
      className="inline-flex items-center gap-2 font-arial font-bold text-[12px] leading-[24px] text-accent"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={`${t('choose')} ${name}`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
    >
      <span aria-hidden>{t('choose')}</span>
      <span aria-hidden className={`size-5 appearance-none border border-accent ${selected ? 'bg-accent' : ''}`} />
    </span>
  );
};

export const OpportunityCard = ({
  description,
  employmentOutlook,
  hasRestrictions,
  industryName,
  matchLabel,
  matchValue,
  mostCommonEducationBackground,
  name,
  trend,
  type,
  selected,
  toggleSelection,
}: OpportunityCardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  return (
    <div className="rounded shadow-border bg-white pt-5 pr-5 pl-6 pb-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
        <div className="flex flex-row justify-between align-center">
          <Match match={matchValue} label={matchLabel} bg={bgForType(type)} />
          {!sm && <SelectedCheckbox selected={selected} toggleSelection={toggleSelection} name={name} />}
        </div>
        {!sm && <div className="text-[22px] leading-[34px] font-bold text-black">{name}</div>}
        <div className="flex flex-col gap-y-2">
          {sm && (
            <div className="flex flex-row justify-between">
              <span className="text-heading-2 text-black hyphens-auto">{name}</span>
              <SelectedCheckbox selected={selected} toggleSelection={toggleSelection} name={name} />
            </div>
          )}
          <span className="font-arial text-body-md">{description}</span>
          <div className="mt-4 flex flex-wrap">
            <BottomBox title={t('tool.competences.trend')}>
              <span className="text-accent" aria-label={t(`tool.competences.trend-${trend}`)}>
                {trend === 'NOUSEVA' ? <HiTrendingUp size={24} /> : <HiTrendingDown size={24} />}
              </span>
            </BottomBox>
            <BottomBox title={t('tool.competences.employment-outlook')}>
              <OutlookDots
                outlook={employmentOutlook}
                ariaLabel={t('tool.competences.outlook-value', { outlook: employmentOutlook })}
              />
            </BottomBox>
            {hasRestrictions && (
              <BottomBox title={t('tool.competences.maybe-has-restrictions')}>
                <MdBlock className="text-accent" size={20} />
              </BottomBox>
            )}
            {industryName && (
              <BottomBox title={`${t('tool.competences.idustry-name')}:`}>
                <span className="font-bold">Lorem ipsum dolor</span>
              </BottomBox>
            )}
            {mostCommonEducationBackground && (
              <BottomBox title={`${t('tool.competences.common-educational-background')}:`}>
                <span className="font-bold">Lorem ipsum dolor</span>
              </BottomBox>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
