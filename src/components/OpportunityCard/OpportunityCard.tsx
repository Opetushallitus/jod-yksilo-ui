import { components } from '@/api/schema';
import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { cx } from '@jod/design-system';
import { JodInfo } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import { TooltipWrapper } from '../Tooltip/TooltipWrapper';

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
  ammattiryhma?: components['schemas']['AmmattiryhmaBasicDto'];
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
  as?: React.ElementType;
  to?: string;
  name: string;
  description: string;
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
  matchValue?: number;
  matchLabel?: string;
  type: MahdollisuusTyyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal';
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
} & FavoriteProps &
  MenuProps;

const OpportunityDetail = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
  return (
    <div className="flex flex-col">
      <div className="text-body-xs flex gap-4 items-center">
        <span>{title}:</span>
        {icon}
      </div>
      <div className="text-heading-3 text-secondary-1-dark">{value}</div>
    </div>
  );
};

interface ActionsSectionProps {
  hideFavorite: boolean;
  menuId?: string;
  menuContent?: React.ReactNode;
  isFavorite?: boolean;
  onToggleFavorite: () => void;
  name: string;
}

const ActionsSection = ({
  hideFavorite,
  menuId,
  menuContent,
  isFavorite,
  onToggleFavorite,
  name,
}: ActionsSectionProps) => {
  const nothingToShow = hideFavorite && !menuId && !menuContent;
  return nothingToShow ? (
    <></>
  ) : (
    <div className="grow flex flex-col sm:flex-row flex-wrap gap-x-5 gap-y-4 sm:gap-y-2 justify-end">
      {!hideFavorite && (
        <FavoriteToggle isFavorite={!!isFavorite} onToggleFavorite={onToggleFavorite} favoriteName={name} />
      )}
      {menuId && menuContent && <MoreActionsDropdown menuId={menuId} menuContent={menuContent} />}
    </div>
  );
};

export const OpportunityCard = ({
  as: Component = 'div',
  to,
  from,
  description,
  ammattiryhma,
  ammattiryhmaNimet,
  matchLabel,
  matchValue,
  name,
  aineisto,
  tyyppi,
  type,
  toggleFavorite,
  isFavorite,
  isLoggedIn,
  hideFavorite,
  headingLevel,
  menuContent,
  menuId,
}: OpportunityCardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const state = useLocation().state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });
  const { showDialog, closeAllModals } = useModal();
  const TitleTag = headingLevel || 'span';

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

  const cardTypeTitle = React.useMemo(() => {
    if (type === 'TYOMAHDOLLISUUS') {
      return t(`opportunity-type.work.${aineisto || 'TMT'}`);
    } else {
      return t(`opportunity-type.education.${tyyppi || 'EI_TUTKINTO'}`);
    }
  }, [type, t, aineisto, tyyppi]);
  return (
    <Component className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border" data-testid="opportunity-card">
      <div className="order-2 flex flex-col">
        <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">{cardTypeTitle}</span>
        {to ? (
          <NavLink to={to} state={{ from }} data-testid="opportunity-card-title-link">
            <TitleTag className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto text-secondary-1-dark hover:underline">
              {name}
            </TitleTag>
          </NavLink>
        ) : (
          <TitleTag
            className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto"
            data-testid="opportunity-card-title"
          >
            {name}
          </TitleTag>
        )}
        <p className="font-arial text-body-md-mobile sm:text-body-md">{description}</p>
        <div className="flex flex-col mt-5 gap-3">
          {type === 'TYOMAHDOLLISUUS' && ammattiryhma ? (
            <>
              <OpportunityDetail
                title={t('tool.job-opportunity-is-part-of-group')}
                value={ammattiryhmaNimet !== undefined ? getLocalizedText(ammattiryhmaNimet[ammattiryhma.uri]) : ''}
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
                value={(ammattiryhma.mediaaniPalkka?.toString() || '---') + ' ' + t('tool.salary-suffix')}
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
        </div>
      </div>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-x-7 gap-y-5 mb-5 ${typeof matchValue === 'number' && matchLabel ? 'justify-between' : 'justify-end'}`}
        data-testid="opportunity-card-actions"
      >
        {typeof matchValue === 'number' && matchLabel && (
          <div
            className={cx('flex flex-nowrap gap-x-3 items-center px-4 text-white rounded-full select-none', {
              'bg-[#AD4298]': type === 'TYOMAHDOLLISUUS',
              'bg-[#00818A]': type === 'KOULUTUSMAHDOLLISUUS',
            })}
            data-testid="opportunity-card-match"
          >
            <span className="text-heading-2-mobile leading-8">{Math.round(matchValue * 100)}%</span>
            <span className="text-body-xs font-arial font-bold">{matchLabel}</span>
          </div>
        )}

        <ActionsSection
          hideFavorite={!!hideFavorite}
          menuId={menuId}
          menuContent={menuContent}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          name={name}
        />
      </div>
    </Component>
  );
};
