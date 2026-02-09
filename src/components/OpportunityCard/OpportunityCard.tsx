import type { components } from '@/api/schema';
import { FavoriteToggle } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { Accordion } from '@jod/design-system';
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

export type EducationOpportunityData = Pick<TypedMahdollisuus, 'kesto' | 'tyyppi' | 'yleisinKoulutusala'>;
export type JobOpportunityData = Pick<TypedMahdollisuus, 'aineisto' | 'ammattiryhma'> & {
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
  type: MahdollisuusTyyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal' | 'search';
  rateId?: string;
  children?: React.ReactNode;
  hideIcon?: boolean;
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
  matchValue,
  matchLabel,
}: ActionsSectionProps) => {
  const hasMatchInfo = typeof matchValue === 'number' && matchLabel;
  const nothingToShow = hideFavorite && !menuId && !menuContent && !actionButtonContent && !hasMatchInfo;

  return nothingToShow ? (
    <></>
  ) : (
    <div className="flex flex-row justify-between items-center mb-3">
      {hasMatchInfo ? (
        <div
          className={'flex flex-col sm:flex-row flex-nowrap gap-x-2 items-center select-none'}
          data-testid="opportunity-card-match"
        >
          <span className="text-accent text-[30px] sm:text-[34px] leading-[32px] sm:leading-[35px] font-[400]">
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
            bgClassName="bg-bg-gray"
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
  type,
  hideIcon,
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
  aineisto,
  tyyppi,
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

  const onToggleFavorite = () => {
    if (hideFavorite) {
      return;
    }

    if (!isLoggedIn) {
      showDialog({
        title: t('common:login'),
        description: t('login-for-favorites'),
        footer: createLoginDialogFooter(t, loginLink, closeAllModals),
      });
    } else {
      toggleFavorite?.();
    }
  };

  const content = (
    <>
      <p className="font-arial text-body-md-mobile sm:text-body-md">{description}</p>
      <div className="flex flex-col mt-3 gap-3">{children}</div>
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
                mahdollisuusTyyppi={type}
                headingLevel={headingLevel}
                hideIcon={hideIcon}
                from={from}
                rateId={rateId}
                aineisto={aineisto}
                tyyppi={tyyppi}
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
            mahdollisuusTyyppi={type}
            headingLevel={headingLevel}
            from={from}
            rateId={rateId}
            aineisto={aineisto}
            hideIcon={hideIcon}
            tyyppi={tyyppi}
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
  headingLevel,
  from,
  rateId,
  aineisto,
  hideIcon,
  tyyppi,
}: {
  to?: string;
  name: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  from?: 'tool' | 'favorite' | 'path' | 'goal' | 'search';
  rateId?: string;
  hideIcon?: boolean;
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
}) => {
  const TitleTag = headingLevel || 'span';

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
          <TitleTag className="text-heading-2-mobile sm:text-heading-2 leading-6 hyphens-auto text-secondary-1-dark hover:underline pb-2">
            {name}
          </TitleTag>
        </NavLink>
      ) : (
        <TitleTag
          className="text-heading-2-mobile sm:text-heading-2 leading-6 hyphens-auto pb-2"
          data-testid="opportunity-card-title"
        >
          {name}
        </TitleTag>
      )}
    </>
  );

  return (
    <div className="flex flex-row">
      {!hideIcon && (
        <div className="flex items-center justify-center size-8 aspect-square rounded-full text-white bg-secondary-1-dark-2 print:hidden">
          <TitleIcon tyyppi={mahdollisuusTyyppi} aineisto={aineisto} />
        </div>
      )}
      <div className="ml-4 flex flex-col justify-center">
        <OpportunityType mahdollisuusTyyppi={mahdollisuusTyyppi} aineisto={aineisto} tyyppi={tyyppi} />
        {titleContent}
      </div>
    </div>
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
