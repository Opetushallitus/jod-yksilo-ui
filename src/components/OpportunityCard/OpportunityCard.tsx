import type { components } from '@/api/schema';
import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusAlityyppi, MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { useIsSessionExpired } from '@/stores/useSessionManagerStore';
import { Accordion, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
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
    <div className="flex flex-row justify-between items-center sm:mb-3">
      {hasMatchInfo ? (
        <div
          className={'flex flex-col sm:flex-row flex-nowrap gap-x-2 items-center select-none'}
          data-testid="opportunity-card-match"
        >
          <span className="text-accent text-[30px] sm:text-[34px] leading-7 sm:leading-[35px] font-normal">
            {Math.round(matchValue * 100)}%
          </span>
          <span className="text-body-xs font-semibold text-primary-gray">{matchLabel}</span>
        </div>
      ) : (
        <div></div>
      )}
      <div
        className="flex sm:flex-row flex-wrap gap-x-5 gap-y-4 sm:gap-y-2 justify-end items-center"
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
  const state = useLocation().state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });
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
        footer: createLoginDialogFooter(t, loginLink, closeAllModals),
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
      className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border gap-y-4"
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
            className={`text-card-heading-mobile sm:text-card-heading hyphens-auto ${textColorClassName} hover:underline pb-2`}
          >
            {name}
          </TitleTag>
        </NavLink>
      ) : (
        <TitleTag
          className={`text-card-heading-mobile sm:text-card-heading hyphens-auto pb-2 ${textColorClassName}`}
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
            className={`flex items-center justify-center size-7 aspect-square rounded-full text-white ${bgColorClassName} print:hidden`}
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
        className={`flex items-center justify-center size-8 aspect-square rounded-full text-white ${bgColorClassName} print:hidden`}
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
