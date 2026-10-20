import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cx, EmptyState } from '@jod/design-system';

import type { MahdollisuusTyyppi } from '@/routes/types';

export const MAX_RELATED_OPPORTUNITIES = 5;

export interface RelatedOpportunity {
  id: string;
  title: string;
  /** The opportunity is shown struck through, as it is not similar enough to be recommended. */
  lowSimilarity?: boolean;
}

interface RelatedOpportunitiesProps {
  /** Type of the opportunity the similar opportunities are shown for. Its own type is the initially selected tab. */
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  opportunities: Record<MahdollisuusTyyppi, RelatedOpportunity[]>;
  /**
   * How the opportunities were found. `osaamiset` lists opportunities sharing osaamiset with the opportunity,
   * `kohtaanto` lists the best matches of the kohtaanto suggestions. Affects the descriptions and the test ids, so
   * both variants can be shown on the same page.
   */
  variant?: 'osaamiset' | 'kohtaanto';
}

const TABS: MahdollisuusTyyppi[] = ['TYOMAHDOLLISUUS', 'KOULUTUSMAHDOLLISUUS'];

/**
 * Lists up to five similar opportunities of the selected type, or an empty state when there are none.
 * The similar opportunities can be switched between työmahdollisuudet and koulutusmahdollisuudet.
 */
export const RelatedOpportunities = ({
  mahdollisuusTyyppi,
  opportunities,
  variant = 'osaamiset',
}: RelatedOpportunitiesProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const id = React.useId();
  const [selected, setSelected] = React.useState<MahdollisuusTyyppi>(mahdollisuusTyyppi);
  const tabRefs = React.useRef<Partial<Record<MahdollisuusTyyppi, HTMLButtonElement | null>>>({});

  const tabLabels: Record<MahdollisuusTyyppi, string> = {
    TYOMAHDOLLISUUS: t('job-opportunities'),
    KOULUTUSMAHDOLLISUUS: t('education-opportunities'),
  };

  const descriptionsByVariant: Record<
    NonNullable<RelatedOpportunitiesProps['variant']>,
    Record<MahdollisuusTyyppi, Record<MahdollisuusTyyppi, string>>
  > = {
    osaamiset: {
      TYOMAHDOLLISUUS: {
        TYOMAHDOLLISUUS: t('related-opportunities.description.job-to-job'),
        KOULUTUSMAHDOLLISUUS: t('related-opportunities.description.job-to-education'),
      },
      KOULUTUSMAHDOLLISUUS: {
        TYOMAHDOLLISUUS: t('related-opportunities.description.education-to-job'),
        KOULUTUSMAHDOLLISUUS: t('related-opportunities.description.education-to-education'),
      },
    },
    kohtaanto: {
      TYOMAHDOLLISUUS: {
        TYOMAHDOLLISUUS: t('related-opportunities.kohtaanto-description.job-to-job'),
        KOULUTUSMAHDOLLISUUS: t('related-opportunities.kohtaanto-description.job-to-education'),
      },
      KOULUTUSMAHDOLLISUUS: {
        TYOMAHDOLLISUUS: t('related-opportunities.kohtaanto-description.education-to-job'),
        KOULUTUSMAHDOLLISUUS: t('related-opportunities.kohtaanto-description.education-to-education'),
      },
    },
  };
  const descriptions = descriptionsByVariant[variant];
  const testId = variant === 'osaamiset' ? 'related-opportunities' : `related-opportunities-${variant}`;
  const itemTestId = variant === 'osaamiset' ? 'related-opportunity' : `related-opportunity-${variant}`;

  const visibleOpportunities = opportunities[selected].slice(0, MAX_RELATED_OPPORTUNITIES);

  const slug =
    selected === 'TYOMAHDOLLISUUS' ? t('slugs.job-opportunity.index') : t('slugs.education-opportunity.index');

  const selectTab = (tyyppi: MahdollisuusTyyppi) => {
    setSelected(tyyppi);
    tabRefs.current[tyyppi]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex: number;
    switch (event.key) {
      case 'ArrowLeft':
        targetIndex = Math.max(index - 1, 0);
        break;
      case 'ArrowRight':
        targetIndex = Math.min(index + 1, TABS.length - 1);
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(TABS[targetIndex]);
  };

  return (
    <div className="mb-7 flex w-full flex-col" data-testid={testId}>
      <div role="tablist" className="flex gap-3 text-button-sm select-none">
        {TABS.map((tyyppi, index) => {
          const active = tyyppi === selected;
          return (
            <button
              key={tyyppi}
              ref={(element) => {
                tabRefs.current[tyyppi] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tyyppi}`}
              aria-selected={active}
              aria-controls={`${id}-tabpanel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(tyyppi)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cx(
                'flex grow cursor-pointer items-center justify-center rounded-t-md px-4 py-4 hyphens-auto',
                {
                  'bg-white text-accent': active,
                  'bg-bg-gray-2': !active,
                },
              )}
              data-testid={`${testId}-tab-${tyyppi}`}
            >
              {tabLabels[tyyppi]}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-tabpanel`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
        className="flex flex-col gap-5 bg-white p-6"
        data-testid={`${testId}-tabpanel-${selected}`}
      >
        <p className="font-arial text-body-md">{descriptions[mahdollisuusTyyppi][selected]}</p>
        {visibleOpportunities.length === 0 ? (
          // The wrapper keeps the inline-flex empty state from stretching to the full width of the flex column
          <div>
            <EmptyState text={t('related-opportunities.empty')} testId={`${testId}-empty`} />
          </div>
        ) : (
          // Safari drops list semantics when list-style is none, so the role is needed
          // oxlint-disable-next-line jsx_a11y/no-redundant-roles
          <ul className="flex flex-col gap-4" role="list">
            {visibleOpportunities.map((opportunity) => (
              <li key={opportunity.id}>
                <Link
                  to={`/${language}/${slug}/${opportunity.id}`}
                  className={cx('text-body-lg wrap-break-word text-accent', {
                    'underline hover:no-underline focus-visible:no-underline': !opportunity.lowSimilarity,
                    'line-through': opportunity.lowSimilarity,
                  })}
                  data-testid={`${itemTestId}-${opportunity.id}`}
                >
                  {opportunity.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
