import { useToolStore } from '@/stores/useToolStore';
import { type PageChangeDetails, Pagination, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { countFilteredEhdotukset } from './utils';

interface YourOpportunitiesPaginationProps {
  scrollRef: React.RefObject<HTMLUListElement | null>;
  className?: string;
  ariaLabel?: string;
}

const YourOpportunitiesPagination = ({ scrollRef, className, ariaLabel }: YourOpportunitiesPaginationProps) => {
  const { t } = useTranslation();
  const {
    ehdotuksetPageNr,
    ehdotuksetPageSize,
    ehdotuksetCount,
    fetchMahdollisuudetPage,
    mahdollisuudetLoading,
    mixedMahdollisuudet,
    filter,
  } = useToolStore(
    useShallow((state) => ({
      ehdotuksetPageNr: state.ehdotuksetPageNr,
      ehdotuksetPageSize: state.ehdotuksetPageSize,
      ehdotuksetCount: state.ehdotuksetCount,
      fetchMahdollisuudetPage: state.fetchMahdollisuudetPage,
      mahdollisuudetLoading: state.mahdollisuudetLoading,
      mixedMahdollisuudet: state.mixedMahdollisuudet,
      filter: state.filters.opportunityType,
    })),
  );
  const { sm } = useMediaQueries();

  const onPageChange = async ({ page }: PageChangeDetails) => {
    if (mahdollisuudetLoading) {
      return;
    }

    await fetchMahdollisuudetPage(undefined, page);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      const focusableElements = scrollRef.current.querySelectorAll(
        'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filters = typeof filter === 'string' ? [filter] : filter;

  return mixedMahdollisuudet.length > 0 ? (
    <div className={className} data-testid="tool-pagination">
      <Pagination
        currentPage={ehdotuksetPageNr}
        serviceVariant="yksilo"
        type="button"
        ariaLabel={ariaLabel}
        pageSize={ehdotuksetPageSize}
        siblingCount={sm ? 1 : 0}
        translations={{
          nextTriggerLabel: t('pagination.next'),
          prevTriggerLabel: t('pagination.previous'),
        }}
        totalItems={countFilteredEhdotukset(filters, ehdotuksetCount)}
        onPageChange={(data) => void onPageChange(data)}
      />
    </div>
  ) : null;
};

export default YourOpportunitiesPagination;
