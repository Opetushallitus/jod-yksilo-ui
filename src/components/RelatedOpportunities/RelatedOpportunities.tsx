import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Carousel, cx, EmptyState } from '@jod/design-system';

import type { Samankaltaiset, SamankaltainenMahdollisuus } from '@/api/samankaltaiset';
import { OpportunityCard } from '@/components';
import { OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { getTypeSlug } from '@/routes/Profile/utils';
import { getMahdollisuusAlityyppi } from '@/routes/Tool/utils';
import { useIsLoggedIn } from '@/stores/useSessionManagerStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';

interface RelatedOpportunitiesProps {
  samankaltaiset: Promise<Samankaltaiset>;
  /** Type of the opportunity the similar opportunities are shown for. Its tab is the first one. */
  tyyppi: SamankaltainenMahdollisuus['mahdollisuusTyyppi'];
}

/** Minimum width of a card in the carousel. Two cards are shown side by side when there is room for them. */
const CARD_MIN_WIDTH = 340;

const LoadingIndicator = () => {
  const { t } = useTranslation();

  return (
    <div data-testid="related-opportunities-loading">
      <div role="status" aria-live="polite" className="sr-only">
        {t('tool.updating')}
      </div>
      <ul aria-hidden="true" className="grid gap-4 md:grid-cols-2">
        <OpportunityCardSkeleton />
        <OpportunityCardSkeleton />
      </ul>
    </div>
  );
};

type OpportunityType = SamankaltainenMahdollisuus['mahdollisuusTyyppi'];

const TABS: { type: OpportunityType; testId: string }[] = [
  { type: 'TYOMAHDOLLISUUS', testId: 'related-opportunities-tab-job' },
  { type: 'KOULUTUSMAHDOLLISUUS', testId: 'related-opportunities-tab-education' },
];

const OpportunityCarousel = ({
  opportunities,
  ammattiryhmaNimet,
}: Pick<Samankaltaiset, 'opportunities' | 'ammattiryhmaNimet'>) => {
  const { t, i18n } = useTranslation();
  const isLoggedIn = useIsLoggedIn();
  const guardedAction = useSessionGuardedAction();
  const { suosikit, toggleSuosikki } = useToolStore(
    useShallow((state) => ({ suosikit: state.suosikit, toggleSuosikki: state.toggleSuosikki })),
  );

  return opportunities.length === 0 ? (
    // The wrapper keeps the inline-flex empty state from stretching to the full width of the flex column
    <div>
      <EmptyState text={t('related-opportunities.empty')} testId="related-opportunities-empty" />
    </div>
  ) : (
    <Carousel
      testId="related-opportunities-carousel"
      itemWidth={CARD_MIN_WIDTH}
      stretch
      // Leaves room for the borders of the cards, which would be cut by the carousel otherwise
      className="-m-1 p-1"
      translations={{
        nextTrigger: t('pagination.next'),
        prevTrigger: t('pagination.previous'),
        indicator: (index) => t('pagination.itemLabel', { page: index + 1 }),
      }}
      items={opportunities.map((mahdollisuus) => ({
        id: mahdollisuus.id,
        component: (
          // The wrapper makes the card fill the whole slide, so the cards are of equal height
          <div className="grid w-full">
            <OpportunityCard
              as="div"
              to={`/${i18n.language}/${getTypeSlug(mahdollisuus.mahdollisuusTyyppi)}/${mahdollisuus.id}`}
              isFavorite={suosikit.some((s) => s.kohdeId === mahdollisuus.id)}
              isLoggedIn={isLoggedIn}
              toggleFavorite={guardedAction(toggleSuosikki, mahdollisuus.id, mahdollisuus.mahdollisuusTyyppi)}
              name={getLocalizedText(mahdollisuus.otsikko)}
              description={getLocalizedText(mahdollisuus.tiivistelma)}
              matchValue={mahdollisuus.pisteet}
              matchLabel={t('fit')}
              headingLevel="h3"
              ammattiryhma={mahdollisuus.ammattiryhma}
              ammattiryhmaNimet={ammattiryhmaNimet}
              kesto={mahdollisuus.kesto}
              yleisinKoulutusala={mahdollisuus.yleisinKoulutusala}
              mahdollisuusTyyppi={mahdollisuus.mahdollisuusTyyppi}
              mahdollisuusAlityyppi={getMahdollisuusAlityyppi(mahdollisuus)}
              rateId={mahdollisuus.id}
            />
          </div>
        ),
      }))}
    />
  );
};

const OpportunityTabs = ({ samankaltaiset, tyyppi }: RelatedOpportunitiesProps) => {
  const { t } = useTranslation();
  const { opportunities, ammattiryhmaNimet } = React.use(samankaltaiset);
  const idPrefix = React.useId();
  const tabRefs = React.useRef<Partial<Record<OpportunityType, HTMLButtonElement | null>>>({});
  const tabs = [...TABS].sort((a, b) => Number(b.type === tyyppi) - Number(a.type === tyyppi));
  // The opportunities of the same type as the source opportunity come first, so the first tab is the one shown, unless
  // it has no opportunities
  const [selectedType, setSelectedType] = React.useState<OpportunityType>(
    opportunities[0]?.mahdollisuusTyyppi ?? tyyppi,
  );

  if (opportunities.length === 0) {
    return <OpportunityCarousel opportunities={[]} ammattiryhmaNimet={ammattiryhmaNimet} />;
  }

  const selectedOpportunities = opportunities.filter((o) => o.mahdollisuusTyyppi === selectedType);

  const selectTab = (type: OpportunityType) => {
    setSelectedType(type);
    tabRefs.current[type]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (event.key in targets) {
      event.preventDefault();
      selectTab(tabs[targets[event.key]].type);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label={t('related-opportunities.title')} className="flex flex-wrap gap-x-6 gap-y-2">
        {tabs.map(({ type, testId }, index) => {
          const selected = type === selectedType;
          const count = opportunities.filter((o) => o.mahdollisuusTyyppi === type).length;
          const name = type === 'TYOMAHDOLLISUUS' ? t('job-opportunities') : t('education-opportunities');
          const label = `${name} (${count})`;
          return (
            <button
              key={type}
              ref={(element) => {
                tabRefs.current[type] = element;
              }}
              id={`${idPrefix}-tab-${type}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${type}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setSelectedType(type)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cx(
                'font-bold cursor-pointer border-b-4 py-2 font-arial text-button-md',
                selected ? 'border-accent text-accent' : 'border-transparent text-primary-gray hover:underline',
              )}
              data-testid={testId}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${idPrefix}-panel-${selectedType}`}
        aria-labelledby={`${idPrefix}-tab-${selectedType}`}
        // A panel without focusable content must be reachable with the keyboard itself
        tabIndex={selectedOpportunities.length === 0 ? 0 : undefined}
        data-testid={`related-opportunities-panel-${selectedType}`}
      >
        <OpportunityCarousel opportunities={selectedOpportunities} ammattiryhmaNimet={ammattiryhmaNimet} />
      </div>
    </div>
  );
};

/**
 * Shows the similar opportunities as cards in carousels, työmahdollisuudet and koulutusmahdollisuudet on tabs of their
 * own, or an empty state when there are none. The suggestions are slow to fetch, so they are given as a promise and a
 * loading indicator is shown until they are resolved.
 */
export const RelatedOpportunities = (props: RelatedOpportunitiesProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-7 flex w-full flex-col gap-5" data-testid="related-opportunities">
      <p className="font-arial text-body-md">{t('related-opportunities.description')}</p>
      <React.Suspense fallback={<LoadingIndicator />}>
        <OpportunityTabs {...props} />
      </React.Suspense>
    </div>
  );
};
