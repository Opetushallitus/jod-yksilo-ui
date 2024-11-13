import { components } from '@/api/schema';
import { ActionButton, FavoriteToggle, LoginModal } from '@/components';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { MahdollisuusTyyppi } from '@/routes/types';
import { cx, PopupList, PopupListItem } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdMoreVert, MdOutlineTrendingDown, MdOutlineTrendingUp } from 'react-icons/md';
import { Link, NavLink, To } from 'react-router-dom';

interface OpportunityCardProps {
  as?: React.ElementType;
  to: string;
  name: string;
  description: string;
  matchValue?: number;
  matchLabel?: string;
  type: MahdollisuusTyyppi;
  trend: components['schemas']['EhdotusMetadata']['trendi'];
  employmentOutlook: number;
  hasRestrictions: boolean;
  industryName?: string;
  mostCommonEducationBackground?: string;
  toggleFavorite: () => void;
  isFavorite?: boolean;
  isLoggedIn?: boolean;
  compareTo?: To;
}

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
    role="note"
    className={`font-arial border border-inactive-gray py-2 px-3 -mr-[1px] -mb-[1px] text-attrib-title flex flex-row items-center gap-2 ${className}`.trim()}
  >
    <span className="flex items-center mr-1">{title}</span>
    <span className="flex items-center">{children}</span>
  </div>
);

const OutlookDots = ({ outlook, ariaLabel }: { outlook: number; ariaLabel: string }) => (
  <div role="figure" className="flex flex-row gap-2" aria-label={ariaLabel}>
    {Array.from({ length: 5 }).map((_, idx) => (
      /* eslint-disable-next-line sonarjs/no-array-index-key*/
      <div key={idx} className={`${idx < outlook ? 'bg-accent' : 'bg-accent-25'} w-4 h-4 rounded-full`} aria-hidden />
    ))}
  </div>
);

const MoreActionsDropdown = ({ compareTo }: { compareTo?: To }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();

  const actionButtonRef = React.useRef<HTMLDivElement>(null);
  const onClose = React.useCallback(() => setOpen(false), []);
  const actionMenuRef = useMenuClickHandler(() => setOpen(false), actionButtonRef);

  return (
    <div className="relative" ref={actionMenuRef}>
      <div ref={actionButtonRef}>
        <ActionButton
          label={t('more-actions')}
          icon={<MdMoreVert size={24} className="text-accent" />}
          aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={open ? 'text-accent' : ''}
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && (
        /* Preventing the click through of the wrapper <div> if not able to click exactly at the list items */
        /* eslint-disable jsx-a11y/click-events-have-key-events */
        /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute -right-2 translate-y-[10px] cursor-auto"
        >
          <PopupList>
            <ul id={listId} className="flex flex-col gap-y-2 w-full">
              {compareTo && (
                <li>
                  <Link to={compareTo} onClick={onClose} type="button">
                    <PopupListItem>{t('compare')}</PopupListItem>
                  </Link>
                </li>
              )}
              <li>
                <Link to="#" onClick={onClose} type="button">
                  <PopupListItem>TODO: {t('create-path')}</PopupListItem>
                </Link>
              </li>
              <li>
                <Link to="#" onClick={onClose} type="button">
                  <PopupListItem>TODO: {t('share')}</PopupListItem>
                </Link>
              </li>
            </ul>
          </PopupList>
        </div>
      )}
    </div>
  );
};

export const OpportunityCard = ({
  as: Component = 'div',
  to,
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
  compareTo,
}: OpportunityCardProps) => {
  const { t } = useTranslation();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const { isDev } = useEnvironment();

  const onToggleFavorite = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else {
      toggleFavorite();
    }
  };

  const cardTypeTitle = type === 'TYOMAHDOLLISUUS' ? t('opportunity-type.work') : t('opportunity-type.education');
  const ActionsSection = (
    <div className="grow flex flex-wrap gap-x-5 gap-y-2 justify-end">
      <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      <MoreActionsDropdown compareTo={compareTo} />
    </div>
  );

  return (
    <>
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      <Component className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border">
        <div className="order-2 flex flex-col">
          <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">{cardTypeTitle}</span>
          <NavLink
            to={to}
            className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto hover:underline hover:text-link"
          >
            {name}
          </NavLink>
          <p className="font-arial text-body-md-mobile sm:text-body-md">{description}</p>
          {isDev && (
            <div className="flex flex-wrap mt-5">
              <BottomBox title={t('opportunity-card.trend')} className="bg-todo">
                {trend === 'NOUSEVA' ? (
                  <MdOutlineTrendingUp size={24} className="text-accent" aria-label={t(`opportunity-card.trend-up`)} />
                ) : (
                  <MdOutlineTrendingDown
                    size={24}
                    className="text-accent"
                    aria-label={t(`opportunity-card.trend-down`)}
                  />
                )}
              </BottomBox>
              <BottomBox title={t('opportunity-card.employment-outlook')} className="bg-todo">
                <OutlookDots
                  outlook={employmentOutlook}
                  ariaLabel={t('opportunity-card.outlook-value', { outlook: employmentOutlook })}
                />
              </BottomBox>
              {hasRestrictions && (
                <BottomBox title={t('opportunity-card.maybe-has-restrictions')} className="bg-todo">
                  <MdBlock className="text-accent" size={20} role="presentation" />
                </BottomBox>
              )}
              {industryName && (
                <BottomBox title={`${t('opportunity-card.industry-name')}:`} className="bg-todo">
                  <span className="font-bold">{industryName}</span>
                </BottomBox>
              )}
              {mostCommonEducationBackground && (
                <BottomBox title={`${t('opportunity-card.common-educational-background')}:`} className="bg-todo">
                  <span className="font-bold">{mostCommonEducationBackground}</span>
                </BottomBox>
              )}
            </div>
          )}
        </div>
        <div
          className={`flex flex-wrap-reverse items-center gap-x-7 gap-y-5 mb-4 order-1 ${typeof matchValue === 'number' && matchLabel ? 'justify-between' : 'justify-end'}`}
        >
          {typeof matchValue === 'number' && matchLabel && (
            <div
              className={cx('flex flex-nowrap gap-x-3 items-center px-4 text-white rounded-full select-none', {
                'bg-[#AD4298]': type === 'TYOMAHDOLLISUUS',
                'bg-[#00818A]': type === 'KOULUTUSMAHDOLLISUUS',
              })}
            >
              <span className="text-heading-2-mobile leading-8">{Math.round(matchValue * 100)}%</span>
              <span className="text-body-xs font-arial font-bold">{matchLabel}</span>
            </div>
          )}
          {ActionsSection}
        </div>
      </Component>
    </>
  );
};
