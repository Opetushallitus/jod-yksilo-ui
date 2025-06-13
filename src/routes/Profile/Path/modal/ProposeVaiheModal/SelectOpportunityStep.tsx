import { useEhdotetutVaiheetStore } from '@/stores/useEhdotetutVaiheetStore';
import { usePolutStore } from '@/stores/usePolutStore';
import { type PageChangeDetails, Pagination, RadioButtonGroup, Spinner, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import VaiheOpportunityCard from './VaiheOpportunityCard';

const SelectOpportunityStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  const { proposedOpportunity, getMissingOsaamisetUris, setProposedOpportunity } = usePolutStore(
    useShallow((state) => ({
      proposedOpportunity: state.proposedOpportunity,
      getMissingOsaamisetUris: state.getMissingOsaamisetUris,
      setProposedOpportunity: state.setProposedOpportunity,
    })),
  );

  const { fetchEhdotukset, fetchPage, isLoading, pageData, pageNr, pageSize, totalItems } = useEhdotetutVaiheetStore(
    useShallow((state) => ({
      fetchEhdotukset: state.fetchEhdotukset,
      fetchPage: state.fetchPage,
      isLoading: state.isLoading,
      pageData: state.pageData,
      pageNr: state.pageNr,
      pageSize: state.pageSize,
      totalItems: state.totalItems,
    })),
  );

  React.useEffect(() => {
    const fetchData = async () => {
      await fetchEhdotukset(getMissingOsaamisetUris());
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const onPageChange = async (data: PageChangeDetails) => {
    await fetchPage(data);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return isLoading ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-1/2">
      <Spinner size={64} color="accent" />
    </div>
  ) : (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1">
        {t('profile.paths.choose-for-phase', { count: vaiheIndex + 1 })}
      </h1>
      {!isLoading && totalItems === 0 ? (
        <p className="mt-7">{t('profile.paths.proposed-opportunities-not-found')}</p>
      ) : (
        <div className="flex flex-row mt-6 gap-5" ref={scrollRef}>
          <div className="flex flex-col gap-6">
            <RadioButtonGroup
              label={t('profile.paths.choose-one-opportunity')}
              hideLabel
              value={proposedOpportunity?.id ?? ''}
              onChange={(id) => {
                const opportunity = pageData.find((o) => o.id === id);
                if (opportunity) {
                  setProposedOpportunity(opportunity);
                }
              }}
            >
              <div className="flex flex-col gap-5">
                {pageData.map((mahdollisuus) => (
                  <VaiheOpportunityCard key={mahdollisuus.id} mahdollisuus={mahdollisuus} />
                ))}
              </div>
            </RadioButtonGroup>
            {pageData.length > 0 && (
              <div className="mt-5">
                <Pagination
                  currentPage={pageNr}
                  onPageChange={onPageChange}
                  pageSize={pageSize}
                  siblingCount={sm ? 1 : 0}
                  translations={{
                    nextTriggerLabel: t('pagination.next'),
                    prevTriggerLabel: t('pagination.previous'),
                  }}
                  totalItems={totalItems}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SelectOpportunityStep;
