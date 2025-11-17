import type { components } from '@/api/schema';
import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { Accordion, tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import { EducationOpportunityCard } from './EducationOpportunityCard';
import { JobOpportunityCard } from './JobOpportunityCard';

type CollapsibleProps =
  | {
      /** Whether the card content is collapsible */
      collapsible: true;
      /** Whether the card content is initially collapsed */
      initiallyCollapsed?: boolean;
    }
  | {
      collapsible?: never;
      initiallyCollapsed?: never;
    };

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

export type EducationOpportunityData = Pick<TypedMahdollisuus, 'kesto' | 'tyyppi' | 'yleisinKoulutusala'>;
export type JobOpportunityData = Pick<TypedMahdollisuus, 'aineisto' | 'ammattiryhma'> & {
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
};

interface BaseProps {
  as?: React.ElementType;
  to?: string;
  name: string;
  description: string;
  cardTypeTitle?: string;
  matchValue?: number;
  matchLabel?: string;
  type: MahdollisuusTyyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal';
  rateId?: string;
  children?: React.ReactNode;
  matchValueBgColorClassName?: string;
}

export type OpportunityCardProps = BaseProps &
  FavoriteProps &
  MenuProps &
  JobOpportunityData &
  CollapsibleProps &
  EducationOpportunityData;

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

export const OpportunityCardWrapper = ({
  as: Component = 'div',
  children,
  to,
  from,
  description,
  cardTypeTitle,
  matchLabel,
  matchValue,
  name,
  type,
  toggleFavorite,
  isFavorite,
  isLoggedIn,
  hideFavorite,
  headingLevel,
  menuContent,
  matchValueBgColorClassName = 'bg-secondary-4-dark',
  menuId,
  rateId,
  collapsible,
  initiallyCollapsed,
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

  const titleContent = (
    <>
      {to ? (
        <NavLink
          to={to}
          state={{ from }}
          data-testid="opportunity-card-title-link"
          onClick={() => {
            if (rateId) {
              globalThis._paq?.push([
                'trackEvent',
                type === 'TYOMAHDOLLISUUS' ? 'yksilo.Työmahdollisuus' : 'yksilo.Koulutusmahdollisuus',
                'Klikkaus',
                rateId,
              ]);
            }
          }}
          className="order-2"
        >
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
    </>
  );

  const content = (
    <>
      <p className="order-3 font-arial text-body-md-mobile sm:text-body-md">{description}</p>
      <div className="flex flex-col order-4 mt-5 gap-3">{children}</div>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-x-7 gap-y-5 mb-5 ${typeof matchValue === 'number' && matchLabel ? 'justify-between' : 'justify-end'}`}
        data-testid="opportunity-card-actions"
      >
        {typeof matchValue === 'number' && matchLabel && (
          <div
            className={tc([
              'flex flex-nowrap gap-x-3 items-center px-4 text-white rounded-full select-none',
              matchValueBgColorClassName,
            ])}
            data-testid="opportunity-card-match"
          >
            <span className="text-heading-2-mobile leading-8">{Math.round(matchValue * 100)}%</span>
            <span className="text-body-xs font-arial font-bold">{matchLabel}</span>
          </div>
        )}
      </div>
    </>
  );
  const triggerId = `${name}-trigger`;
  const contentId = `${name}-content`;

  return (
    <Component className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border" data-testid="opportunity-card">
      <ActionsSection
        hideFavorite={!!hideFavorite}
        menuId={menuId}
        menuContent={menuContent}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        name={name}
      />
      {collapsible ? (
        <Accordion
          initialState={initiallyCollapsed}
          title={
            <div className="flex flex-col">
              <div className="order-2 flex flex-col w-fit">{titleContent}</div>
              <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase pt-5 order-1">
                {cardTypeTitle}
              </span>
            </div>
          }
          ariaLabel={name}
          triggerId={triggerId}
          ariaControls={contentId}
        >
          <section id={contentId} className="-mt-2 -mb-5">
            {content}
          </section>
        </Accordion>
      ) : (
        <>
          <div className="order-2 flex flex-col w-fit">{titleContent}</div>
          <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase order-1">
            {cardTypeTitle}
          </span>
          <>{content}</>
        </>
      )}
    </Component>
  );
};

export const OpportunityCard = (props: OpportunityCardProps) => {
  return props.type === 'KOULUTUSMAHDOLLISUUS' ? (
    <EducationOpportunityCard
      {...props}
      tyyppi={props.tyyppi}
      kesto={props.kesto}
      yleisinKoulutusala={props.yleisinKoulutusala}
    />
  ) : (
    <JobOpportunityCard
      {...props}
      aineisto={props.aineisto}
      ammattiryhma={props.ammattiryhma}
      ammattiryhmaNimet={props.ammattiryhmaNimet}
    />
  );
};
