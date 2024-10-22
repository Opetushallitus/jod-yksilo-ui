import { components } from '@/api/schema';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button, ConfirmDialog, Modal, PopupList, PopupListItem, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdBlock,
  MdFavorite,
  MdFavoriteBorder,
  MdMoreVert,
  MdOutlineTrendingDown,
  MdOutlineTrendingUp,
} from 'react-icons/md';
import { Link } from 'react-router-dom';

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
  toggleFavorite: () => void;
  isFavorite?: boolean;
  isLoggedIn?: boolean;
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
      {match !== undefined && match >= 0 && (
        <>
          <span className="mr-3 sm:mr-0 text-heading-2-mobile sm:text-heading-2">{Math.round(match * 100)}%</span>
          <span className="flex justify-center text-body-xs font-arial font-bold">{label}</span>
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
    className={`font-arial border border-inactive-gray py-2 px-3 -mr-[1px] -mb-[1px] text-attrib-title flex flex-row items-center gap-2 ${className}`.trim()}
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

const ActionButton = ({
  label,
  icon,
  className = '',
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}) => (
  <button
    className={`flex items-center gap-x-3 text-button-sm text-nowrap ${className}`.trim()}
    onClick={(e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
  >
    {icon}
    {label}
  </button>
);

const FavoriteToggle = ({ isFavorite, onToggleFavorite }: { isFavorite?: boolean; onToggleFavorite: () => void }) => {
  const { t } = useTranslation();

  return isFavorite ? (
    <ConfirmDialog
      title={t('remove-favorite-confirmation-title')}
      onConfirm={onToggleFavorite}
      confirmText={t('delete')}
      cancelText={t('cancel')}
      variant="destructive"
      description={t('remove-favorite-opportunity-confirmation')}
    >
      {(showDialog: () => void) => (
        <ActionButton
          label={t('remove-favorite')}
          icon={<MdFavorite size={24} className="text-accent" aria-hidden />}
          onClick={showDialog}
        />
      )}
    </ConfirmDialog>
  ) : (
    <ActionButton
      label={t('add-favorite')}
      icon={<MdFavoriteBorder size={24} className="text-accent" />}
      onClick={onToggleFavorite}
    />
  );
};

const MoreActionsDropdown = () => {
  const { t } = useTranslation();
  const [open, isOpen] = React.useState(false);
  const listId = React.useId();

  const onClose = React.useCallback(() => isOpen(false), []);

  return (
    <div className="relative">
      <ActionButton
        label={t('more-actions')}
        icon={<MdMoreVert size={24} className="text-accent" />}
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={open ? 'text-accent' : ''}
        onClick={() => isOpen(!open)}
      />
      {open && (
        <div id={listId} role="listbox" className="absolute -right-2 translate-y-[10px] cursor-auto">
          <PopupList classNames="gap-y-2">
            <Link to="/" onClick={onClose} type="button">
              <PopupListItem>{t('compare')}</PopupListItem>
            </Link>
            <Link to={'/'} onClick={onClose} type="button">
              <PopupListItem>{t('create-path')}</PopupListItem>
            </Link>
            <Link to={'/'} onClick={onClose} type="button">
              <PopupListItem>{t('share')}</PopupListItem>
            </Link>
          </PopupList>
        </div>
      )}
    </div>
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
  toggleFavorite,
  isFavorite,
  isLoggedIn,
}: OpportunityCardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const onToggleFavorite = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else {
      toggleFavorite();
    }
  };

  const cardTypeTitle = type === 'work' ? t('opportunity-type.work') : t('opportunity-type.education');
  const ActionsSection = (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3 sm:mb-0">
      <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      <MoreActionsDropdown />
    </div>
  );

  return (
    <>
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      <div className="rounded shadow-border bg-white pt-5 pr-5 pl-5 sm:pl-6 pb-5 sm:pb-7">
        <div className="flex flex-col sm:flex-row sm:gap-5">
          {!sm && ActionsSection}
          <div className="flex flex-row justify-between align-center">
            <div>
              {typeof matchValue === 'number' && matchLabel && (
                <Match match={matchValue} label={matchLabel} bg={bgForType(type)} />
              )}
            </div>
          </div>
          {!sm && (
            <div className="text-black mt-3 mb-2">
              <span className="font-arial text-body-sm-mobile uppercase">{cardTypeTitle}</span>
              <div className="text-heading-2-mobile hyphens-auto">{name}</div>
            </div>
          )}
          <div className="flex flex-col gap-y-2">
            {sm && (
              <div className="flex flex-col mt-3 text-black">
                <div className="flex flex-row flex-wrap-reverse gap-x-5 gap-y-5 justify-between items-center">
                  <span className="font-arial text-body-sm uppercase">{cardTypeTitle}</span>
                  {ActionsSection}
                </div>
                <span className="text-heading-2 hyphens-auto">{name}</span>
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
                  <span className="font-bold">{industryName}</span>
                </BottomBox>
              )}
              {mostCommonEducationBackground && (
                <BottomBox title={`${t('tool.competences.common-educational-background')}:`} className="bg-todo">
                  <span className="font-bold">{mostCommonEducationBackground}</span>
                </BottomBox>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
