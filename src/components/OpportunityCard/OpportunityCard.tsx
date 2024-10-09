import { components } from '@/api/schema';
import { useLoginLink } from '@/hooks/useLoginLink';
import { ToolLoaderData } from '@/routes/Tool/loader';
import { Button, Modal, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdBlock,
  MdOutlineStar,
  MdOutlineStarBorder,
  MdOutlineTrendingDown,
  MdOutlineTrendingUp,
} from 'react-icons/md';
import { useLoaderData } from 'react-router-dom';

type CardType = 'work' | 'education';
interface OpportunityCardProps {
  name: string;
  description: string;
  matchValue?: number;
  matchLabel?: string;
  type: CardType;
  trend: components['schemas']['EhdotusMetadata']['trendi'];
  employmentOutlook: number;
  hasRestrictions: boolean;
  industryName?: string;
  mostCommonEducationBackground?: string;
  selected: boolean;
  toggleSelection: () => void;
  toggleFavorite: () => void;
  isFavorite?: boolean;
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
      className={`${bg} flex flex-row shrink-0 sm:flex-col rounded-lg sm:rounded-[40px] sm:min-h-[80px] w-[132px] sm:w-[80px] h-[32px] text-white justify-center text-center items-center sm:mt-3`}
    >
      {match !== undefined && match > 0 && (
        <>
          <span className="mr-3 sm:mr-0 font-semibold text-[22px] sm:text-[24px]">{Math.round(match * 100)}%</span>
          <span className="flex justify-center text-[12px] leading-[16px] font-arial font-bold">{label}</span>
        </>
      )}
    </div>
  );
};

const BottomBox = ({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`font-arial border border-inactive-gray py-2 px-3 -mr-[1px] -mb-[1px] text-[12px] leading-[20px] flex flex-row items-center gap-2 ${className}`.trim()}
  >
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
      className="inline-flex items-center gap-2 font-bold text-[12px] leading-[24px] text-accent bg-todo"
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

interface FavoriteToggleProps {
  isFavorite?: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}
const FavoriteToggle = ({ isFavorite, onToggleFavorite }: FavoriteToggleProps) => {
  const { t } = useTranslation();
  const buttonClassName = 'bg-white rounded w-full flex justify-center';

  return isFavorite ? (
    <button className={buttonClassName} onClick={onToggleFavorite} aria-label={t('remove-favorite')}>
      <MdOutlineStar size={26} className="text-secondary-3" />
    </button>
  ) : (
    <button className={buttonClassName} onClick={onToggleFavorite} aria-label={t('add-favorite')}>
      <MdOutlineStarBorder size={26} className="text-secondary-gray" />
    </button>
  );
};

interface LoginModalProps {
  onClose: () => void;
  isOpen: boolean;
}
const LoginModal = ({ onClose, isOpen }: LoginModalProps) => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();

  return (
    <Modal
      open={isOpen}
      content={
        <>
          <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('login')}</h2>
          <div className="mb-6">{t('login-for-favorites')}</div>
        </>
      }
      footer={
        <div className="flex justify-end gap-5">
          <Button
            label={t('login')}
            variant="gray"
            LinkComponent={({ children }) => <a href={loginLink}>{children}</a>}
          />
          <Button onClick={onClose} label={t('close')} />
        </div>
      }
    />
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
  toggleFavorite,
  isFavorite,
}: OpportunityCardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const { isLoggedIn } = useLoaderData() as ToolLoaderData;
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const onToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else {
      toggleFavorite();
    }
  };

  const cardTypeTitle = type == 'work' ? t('opportunity-type.work') : t('opportunity-type.education');
  const ActionSection = (
    <div className="flex flex-row gap-5">
      <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      <SelectedCheckbox selected={selected} toggleSelection={toggleSelection} name={name} />
    </div>
  );

  return (
    <>
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      <div className="rounded shadow-border bg-white pt-5 pr-5 pl-6 pb-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
          <div className="flex flex-row justify-between align-center">
            {matchValue && matchLabel && <Match match={matchValue} label={matchLabel} bg={bgForType(type)} />}
            {!sm && ActionSection}
          </div>
          {!sm && <div className="text-[22px] leading-[34px] font-bold text-black hyphens-auto">{name}</div>}
          <div className="flex flex-col gap-y-2">
            {sm && (
              <div className="flex flex-col mt-3">
                <div className="flex flex-row justify-between items-center">
                  <span className="font-arial text-body-sm text-black uppercase leading-[24px]">{cardTypeTitle}</span>
                  {ActionSection}
                </div>
                <span className="text-heading-2 text-black hyphens-auto">{name}</span>
              </div>
            )}
            <span className="font-arial text-body-md">{description}</span>
            <div className="mt-4 flex flex-wrap">
              <BottomBox title={t('tool.competences.trend')} className="bg-todo">
                <span className="text-accent" aria-label={t(`tool.competences.trend-${trend}`)}>
                  {trend === 'NOUSEVA' ? <MdOutlineTrendingUp size={24} /> : <MdOutlineTrendingDown size={24} />}
                </span>
              </BottomBox>
              <BottomBox title={t('tool.competences.employment-outlook')} className="bg-todo">
                <OutlookDots
                  outlook={employmentOutlook}
                  ariaLabel={t('tool.competences.outlook-value', { outlook: employmentOutlook })}
                />
              </BottomBox>
              {hasRestrictions && (
                <BottomBox title={t('tool.competences.maybe-has-restrictions')} className="bg-todo">
                  <MdBlock className="text-accent" size={20} />
                </BottomBox>
              )}
              {industryName && (
                <BottomBox title={`${t('tool.competences.idustry-name')}:`} className="bg-todo">
                  <span className="font-bold">TODO: Lorem ipsum dolor</span>
                </BottomBox>
              )}
              {mostCommonEducationBackground && (
                <BottomBox title={`${t('tool.competences.common-educational-background')}:`} className="bg-todo">
                  <span className="font-bold">TODO: Lorem ipsum dolor</span>
                </BottomBox>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
