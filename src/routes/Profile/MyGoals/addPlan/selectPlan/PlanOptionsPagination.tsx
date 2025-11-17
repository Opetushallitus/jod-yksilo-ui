import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store';
import { type PageChangeDetails, Pagination, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

interface PlanOptionsPaginationProps {
  scrollRef: React.RefObject<HTMLUListElement | null>;
  className?: string;
  ariaLabel?: string;
}

const PlanOptionsPagination = ({ scrollRef, className, ariaLabel }: PlanOptionsPaginationProps) => {
  const { t } = useTranslation();
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

  return koulutusMahdollisuudet.length > 0 ? (
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
        totalItems={totalItems}
        onPageChange={(data) => void onPageChange(data)}
      />
    </div>
  ) : null;
};

export default PlanOptionsPagination;
