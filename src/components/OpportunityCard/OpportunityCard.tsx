import { components } from '@/api/schema';
import { FavoriteToggle, LoginModal } from '@/components';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useEnvironment } from '@/hooks/useEnvironment';
import { MahdollisuusTyyppi } from '@/routes/types';
import { cx } from '@jod/design-system';
import { JodBlock, JodTrendingUp } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

type FavoriteProps =
  | {
      hideFavorite: true;
      toggleFavorite?: never;
      isFavorite?: never;
      isLoggedIn?: never;
    }
  | {
      hideFavorite?: never;
      toggleFavorite: () => void;
      isFavorite: boolean;
      isLoggedIn: boolean;
    };

type MenuProps =
  | {
      // Menu component to use with "Lisää toimintoja"
      menuContent: React.ReactNode;
      // Id of the menu content component, needed for a11y
      menuId: string;
    }
  | {
      menuContent?: never;
      menuId?: never;
    };

type OpportunityCardProps = {
  as?: React.ElementType;
  to?: string;
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
} & FavoriteProps &
  MenuProps;

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
      /* eslint-disable-next-line react/no-array-index-key */
      <div key={idx} className={`${idx < outlook ? 'bg-accent' : 'bg-accent-25'} w-4 h-4 rounded-full`} aria-hidden />
    ))}
  </div>
);

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
  hideFavorite,
  menuContent,
  menuId,
}: OpportunityCardProps) => {
  const { t } = useTranslation();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const { isDev } = useEnvironment();

  const onToggleFavorite = () => {
    if (hideFavorite) {
      return;
    }

    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else {
      toggleFavorite?.();
    }
  };

  const cardTypeTitle = type === 'TYOMAHDOLLISUUS' ? t('opportunity-type.work') : t('opportunity-type.education');
  const ActionsSection =
    menuId && menuContent ? (
      <div className="grow flex flex-wrap gap-x-5 gap-y-2 justify-end">
        {!hideFavorite && <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />}
        <MoreActionsDropdown menuId={menuId} menuContent={menuContent} />
      </div>
    ) : null;

  return (
    <>
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} isOpen={loginModalOpen} />}
      <Component className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border">
        <div className="order-2 flex flex-col">
          <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">{cardTypeTitle}</span>
          {to ? (
            <NavLink
              to={to}
              className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto hover:underline hover:text-accent"
            >
              {name}
            </NavLink>
          ) : (
            <span className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto">{name}</span>
          )}
          <p className="font-arial text-body-md-mobile sm:text-body-md">{description}</p>
          {isDev && (
            <div className="flex flex-wrap mt-5">
              <BottomBox title={t('opportunity-card.trend')} className="bg-todo">
                {trend === 'NOUSEVA' ? (
                  <JodTrendingUp className="text-accent" aria-label={t(`opportunity-card.trend-up`)} />
                ) : (
                  <JodTrendingUp className="text-accent -scale-y-100" aria-label={t(`opportunity-card.trend-down`)} />
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
                  <JodBlock className="text-accent" size={20} role="presentation" />
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
          {menuContent ? ActionsSection : null}
        </div>
      </Component>
    </>
  );
};
