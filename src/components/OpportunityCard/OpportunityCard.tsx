import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

import { Accordion, useMediaQueries } from '@jod/design-system';

import type { components } from '@/api/schema';
import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusAlityyppi, MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { useIsSessionExpired } from '@/stores/useSessionManagerStore';

import { OpportunityType } from '../OpportunityType/OpportunityType';
import { TitleIcon } from '../TitleIcon/TitleIcon';
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

export type EducationOpportunityData = Pick<TypedMahdollisuus, 'kesto' | 'yleisinKoulutusala'>;
export type JobOpportunityData = Pick<TypedMahdollisuus, 'ammattiryhma'> & {
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
};

interface CustomButtonProps {
  actionButtonContent?: React.ReactNode;
}
interface BaseProps {
  as?: React.ElementType;
  to?: string;
  name: string;
  description: string;
  matchValue?: number;
  matchLabel?: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusAlityyppi: MahdollisuusAlityyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal' | 'search';
  rateId?: string;
  children?: React.ReactNode;
}

export type OpportunityCardProps = BaseProps &
  FavoriteProps &
  MenuProps &
  CustomButtonProps &
  JobOpportunityData &
  CollapsibleProps &
  EducationOpportunityData;

interface ActionsSectionProps {
  hideFavorite: boolean;
  menuId?: string;
  menuContent?: React.ReactNode;
  actionButtonContent?: React.ReactNode;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isLoggedIn?: boolean;
  name: string;
  matchValue?: number;
  matchLabel?: string;
}

const ActionsSection = ({
  hideFavorite,
  menuId,
  menuContent,
  isFavorite,
  onToggleFavorite,
  name,
  actionButtonContent,
  isLoggedIn,
  matchValue,
  matchLabel,
}: ActionsSectionProps) => {
  const hasMatchInfo = typeof matchValue === 'number' && matchLabel;
  const nothingToShow = hideFavorite && !menuId && !menuContent && !actionButtonContent && !hasMatchInfo;

  return nothingToShow ? (
    <></>
  ) : (
    <div className="flex flex-row items-center justify-between sm:mb-3">
      {hasMatchInfo ? (
        <div
          className={'flex flex-col flex-nowrap items-center gap-x-2 select-none sm:flex-row'}
          data-testid="opportunity-card-match"
        >
          <span className="font-normal text-[1.875rem] leading-7 text-accent sm:text-[2.125rem] sm:leading-[2.1875rem]">
            {Math.round(matchValue * 100)}%
          </span>
          <span className="font-semibold text-body-xs text-primary-gray">{matchLabel}</span>
        </div>
      ) : (
        <div></div>
      )}
      <div
        className="flex flex-wrap items-center justify-end gap-x-5 gap-y-4 sm:flex-row sm:gap-y-2"
        data-testid="opportunity-card-actions"
      >
        {!hideFavorite && (
          <FavoriteToggle
            isFavorite={!!isFavorite}
            onToggleFavorite={() => onToggleFavorite?.()}
            favoriteName={name}
            opensDialog={!isLoggedIn}
            className="bg-bg-gray"
          />
        )}
        {!!actionButtonContent && actionButtonContent}
        {menuId && menuContent && <MoreActionsDropdown menuId={menuId} menuContent={menuContent} />}
      </div>
    </div>
  );
};

export const OpportunityCardWrapper = ({
  as: Component = 'div',
  children,
  to,
  from,
  description,
  matchLabel,
  matchValue,
  name,
  mahdollisuusTyyppi,
  mahdollisuusAlityyppi,
  toggleFavorite,
  isFavorite,
  isLoggedIn,
  hideFavorite,
  headingLevel,
  menuContent,
  menuId,
  rateId,
  collapsible,
  actionButtonContent,
  initiallyCollapsed,
}: OpportunityCardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { pathname, search, hash, state } = useLocation();
  const { showDialog, closeAllModals } = useModal();
  const isSessionExpired = useIsSessionExpired();

  const onToggleFavorite = () => {
    if (hideFavorite) {
      return;
    }

    // When session has expired, parent often passes a guarded handler — still call it (session-expired UX),
    // not the generic login dialog (isLoggedIn is false for both anonymous and expired).
    if (isLoggedIn || isSessionExpired) {
      toggleFavorite?.();
    } else {
      showDialog({
        title: t('common:login'),
        description: t('login-for-favorites'),
        footer: createLoginDialogFooter(
          t,
          `/${language}/${t('slugs.profile.login')}`,
          state?.callbackUrl ? `/${language}/${state?.callbackUrl}` : `${pathname}${search}${hash}`,
          closeAllModals,
        ),
      });
    }
  };

  const content = (
    <>
      <p className="font-arial text-body-md-mobile sm:text-body-md">{description}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </>
  );

  const triggerId = `${name}-trigger`;
  const contentId = `${name}-content`;

  return (
    <Component
      className="flex flex-col gap-y-4 rounded bg-white p-5 shadow-border sm:p-6"
      data-testid="opportunity-card"
    >
      <ActionsSection
        hideFavorite={!!hideFavorite}
        menuId={menuId}
        menuContent={menuContent}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        name={name}
        isLoggedIn={isLoggedIn}
        actionButtonContent={actionButtonContent}
        matchValue={matchValue}
        matchLabel={matchLabel}
      />
      {collapsible ? (
        <Accordion
          initialState={!initiallyCollapsed}
          title={
            <div className="flex flex-col">
              <OpportunityCardHeader
                to={to}
                name={name}
                mahdollisuusTyyppi={mahdollisuusTyyppi}
                mahdollisuusAlityyppi={mahdollisuusAlityyppi}
                headingLevel={headingLevel}
                from={from}
                rateId={rateId}
              />
            </div>
          }
          ariaLabel={name}
          triggerId={triggerId}
          ariaControls={contentId}
        >
          <section id={contentId} className="mt-3">
            {content}
          </section>
        </Accordion>
      ) : (
        <>
          <OpportunityCardHeader
            to={to}
            name={name}
            mahdollisuusTyyppi={mahdollisuusTyyppi}
            mahdollisuusAlityyppi={mahdollisuusAlityyppi}
            headingLevel={headingLevel}
            from={from}
            rateId={rateId}
          />
          <>{content}</>
        </>
      )}
    </Component>
  );
};

const OpportunityCardHeader = ({
  to,
  name,
  mahdollisuusTyyppi,
  mahdollisuusAlityyppi,
  headingLevel,
  from,
  rateId,
}: {
  to?: string;
  name: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusAlityyppi: MahdollisuusAlityyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal' | 'search';
  rateId?: string;
}) => {
  const TitleTag = headingLevel || 'span';
  const { sm } = useMediaQueries();

  const bgColorClassName =
    mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? 'bg-secondary-2-dark' : 'bg-secondary-4-dark-2';
  const textColorClassName =
    mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? 'text-secondary-2-dark' : 'text-secondary-4-dark-2';

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
                mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' ? 'yksilo.Työmahdollisuus' : 'yksilo.Koulutusmahdollisuus',
                'Klikkaus',
                rateId,
              ]);
            }
          }}
          className="order-2"
        >
          <TitleTag
            className={`text-card-heading-mobile hyphens-auto sm:text-card-heading ${textColorClassName} pb-2 hover:underline`}
          >
            {name}
          </TitleTag>
        </NavLink>
      ) : (
        <TitleTag
          className={`pb-2 text-card-heading-mobile hyphens-auto sm:text-card-heading ${textColorClassName}`}
          data-testid="opportunity-card-title"
        >
          {name}
        </TitleTag>
      )}
    </>
  );

  if (!sm) {
    return (
      <h3 className="flex flex-col gap-2">
        <div className="flex flex-row gap-3">
          <div
            className={`flex aspect-square size-7 items-center justify-center rounded-full text-white ${bgColorClassName} print:hidden`}
            aria-hidden
          >
            <TitleIcon mahdollisuusAlityyppi={mahdollisuusAlityyppi} />
          </div>

          <div className="flex justify-center">
            <OpportunityType mahdollisuusAlityyppi={mahdollisuusAlityyppi} />
          </div>
        </div>
        <div>{titleContent}</div>
      </h3>
    );
  }
  return (
    <h3 className="flex flex-row">
      <div
        className={`flex aspect-square size-8 items-center justify-center rounded-full text-white ${bgColorClassName} print:hidden`}
        aria-hidden
      >
        <TitleIcon mahdollisuusAlityyppi={mahdollisuusAlityyppi} />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <OpportunityType mahdollisuusAlityyppi={mahdollisuusAlityyppi} />
        {titleContent}
      </div>
    </h3>
  );
};

export const OpportunityCard = (props: OpportunityCardProps) => {
  return props.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS' ? (
    <EducationOpportunityCard {...props} />
  ) : (
    <JobOpportunityCard {...props} />
  );
};
