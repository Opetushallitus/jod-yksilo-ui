import { usePaginationTranslations } from '@/hooks/usePaginationTranslations';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { type PageChangeDetails, Pagination, useMediaQueries } from '@jod/design-system';
import { useShallow } from 'zustand/shallow';

interface PlanOptionsPaginationProps {
  scrollRef: React.RefObject<HTMLUListElement | null>;
  className?: string;
  ariaLabel?: string;
}

const PlanOptionsPagination = ({ scrollRef, className, ariaLabel }: PlanOptionsPaginationProps) => {
  const {
    ehdotuksetPageNr,
    ehdotuksetPageSize,
    totalItems,
    fetchMahdollisuudetPage,
    mahdollisuudetLoading,
    koulutusMahdollisuudet,
  } = addPlanStore(
    useShallow((state) => ({
      ehdotuksetPageNr: state.ehdotuksetPageNr,
      ehdotuksetPageSize: state.ehdotuksetPageSize,
      totalItems: state.filteredMahdollisuudetCount,
      fetchMahdollisuudetPage: state.fetchMahdollisuudetPage,
      mahdollisuudetLoading: state.mahdollisuudetLoading,
      koulutusMahdollisuudet: state.koulutusmahdollisuudet,
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

  const paginationTranslations = usePaginationTranslations();

  return koulutusMahdollisuudet.length > 0 ? (
    <div className={className} data-testid="tool-pagination">
      <Pagination
        currentPage={ehdotuksetPageNr}
        serviceVariant="yksilo"
        type="button"
        ariaLabel={ariaLabel}
        pageSize={ehdotuksetPageSize}
        siblingCount={sm ? 1 : 0}
        translations={paginationTranslations}
        totalItems={totalItems}
        onPageChange={(data) => void onPageChange(data)}
      />
    </div>
  ) : null;
};

export default PlanOptionsPagination;
