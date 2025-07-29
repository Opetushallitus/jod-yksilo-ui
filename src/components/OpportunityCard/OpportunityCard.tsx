import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { cx } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

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
  ammattiryhma?: string;
  as?: React.ElementType;
  to?: string;
  name: string;
  description: string;
  matchValue?: number;
  matchLabel?: string;
  type: MahdollisuusTyyppi;
} & FavoriteProps &
  MenuProps;

const OpportunityDetail = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="flex flex-col">
      <div className="text-body-xs flex gap-4 items-center">
        <span>{title}:</span>
        <JodInfo size={18} className="text-[#999]" />
      </div>
      <div className="text-heading-3 text-secondary-1-dark">{value}</div>
    </div>
  );
};

export const OpportunityCard = ({
  as: Component = 'div',
  to,
  description,
  ammattiryhma,
  matchLabel,
  matchValue,
  name,
  type,
  toggleFavorite,
  isFavorite,
  isLoggedIn,
  hideFavorite,
  menuContent,
  menuId,
}: OpportunityCardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { isDev } = useEnvironment();
  const state = useLocation().state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });
  const { showDialog, closeAllModals } = useModal();

  const onToggleFavorite = () => {
    if (hideFavorite) {
      return;
    }

    if (!isLoggedIn) {
      showDialog({
        title: t('login'),
        description: t('login-for-favorites'),
        footer: createLoginDialogFooter(t, loginLink, closeAllModals),
      });
    } else {
      toggleFavorite?.();
    }
  };

  const cardTypeTitle = type === 'TYOMAHDOLLISUUS' ? t('opportunity-type.work') : t('opportunity-type.education');
  const ActionsSection =
    menuId && menuContent ? (
      <div className="grow flex flex-col sm:flex-row flex-wrap gap-x-5 gap-y-4 sm:gap-y-2 justify-end">
        {!hideFavorite && <FavoriteToggle isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />}
        <MoreActionsDropdown menuId={menuId} menuContent={menuContent} />
      </div>
    ) : null;

  return (
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
          <div className="flex flex-col mt-5 gap-3">
            {type === 'TYOMAHDOLLISUUS' && ammattiryhma ? (
              <OpportunityDetail title={t('tool.job-opportunity-is-part-of-group')} value={ammattiryhma} />
            ) : null}
          </div>
        )}
      </div>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-x-7 gap-y-5 mb-5 ${typeof matchValue === 'number' && matchLabel ? 'justify-between' : 'justify-end'}`}
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
  );
};
