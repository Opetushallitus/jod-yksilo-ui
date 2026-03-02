import { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import { getOpintopolkuKoulutus, OpintopolkuKoulutusResponse } from '@/utils/opintopolku';
import { Button, Spinner } from '@jod/design-system';
import { JodOpenInNew, JodPathDuration } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface OpintopolkuKoulutusProps {
  oid: string;
  title: string;
  description: string;
  credits: string | undefined;
  creditUnit: string;
}

const stripHtmlTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const textLines: string[] = [];
  doc.body.childNodes.forEach((childNode) => {
    if ((childNode.textContent ?? '').trim().length > 0) {
      textLines.push(childNode.textContent?.trim() ?? '');
    }
  });
  const result = textLines.join('\n');
  return result;
};

const fallbackLanguages: Record<LangCode, LangCode[]> = {
  fi: ['en', 'sv'],
  sv: ['fi', 'en'],
  en: ['fi', 'sv'],
};

const getLocalizedOpintopolkuText = (text: Record<LangCode, string | undefined> | undefined) => {
  const language = i18n.language as LangCode;
  return text?.[language] ?? fallbackLanguages[language]?.map((lang) => text?.[lang]).find((t) => !!t) ?? '';
};

const getCredits = (metadata: OpintopolkuKoulutusResponse['metadata']): string | undefined => {
  if (metadata.opintojenLaajuusNumero !== undefined && Number.isFinite(metadata.opintojenLaajuusNumero)) {
    return String(metadata.opintojenLaajuusNumero);
  } else if (metadata.opintojenLaajuusNumeroMin !== undefined || metadata.opintojenLaajuusNumeroMax !== undefined) {
    const min = metadata.opintojenLaajuusNumeroMin ?? metadata.opintojenLaajuusNumeroMax;
    const max = metadata.opintojenLaajuusNumeroMax ?? metadata.opintojenLaajuusNumeroMin;
    return min === max ? String(min) : `${min} - ${max}`;
  }
  return undefined;
};

const OpintopolkuKoulutus = ({ oid, title, description, credits, creditUnit }: OpintopolkuKoulutusProps) => {
  const { t } = useTranslation();
  const plainDescription = stripHtmlTags(description);

  return (
    <div className="flex flex-col gap-5 p-7 border-t-5 border-[#397B0F] rounded-md bg-white text-primary-gray">
      <h2 className="text-heading-2 hover:text-accent">
        <a
          href={`https://opintopolku.fi/konfo/${i18n.language}/koulutus/${oid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
          &nbsp;
          <JodOpenInNew ariaLabel={t('common:external-link')} className="inline-flex align-middle mb-1" />
        </a>
      </h2>
      <p className="text-body-md font-arial text-primary-gray line-clamp-3 whitespace-pre-line">{plainDescription}</p>
      {credits && (
        <div className="flex items-center gap-2 text-secondary-gray">
          <JodPathDuration size={24} />
          <span className="text-body-sm font-arial">
            {credits} {creditUnit}
          </span>
        </div>
      )}
    </div>
  );
};

const PAGE_SIZE = 5;

export const OpintopolkuKoulutusList = ({
  koulutukset,
}: {
  koulutukset: components['schemas']['KoulutusmahdollisuusFullDto']['koulutukset'];
}) => {
  const { t } = useTranslation();

  const [fetchedKoulutukset, setFetchedKoulutukset] = React.useState<OpintopolkuKoulutusProps[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const nextIndexRef = React.useRef(0);
  const fetchIdRef = React.useRef(0);

  const oids = React.useMemo(
    () => koulutukset?.map((koulutus) => koulutus.oid).filter((oid): oid is string => !!oid) ?? [],
    [koulutukset],
  );

  // How many items to display
  const displayCount = PAGE_SIZE * page;

  // Check if we have more items to show (fetched more than displayed)
  const hasMore = fetchedKoulutukset.length > displayCount;

  // Items to display (limited to displayCount)
  const displayedKoulutukset = fetchedKoulutukset.slice(0, displayCount);

  const fetchBatch = async (oids: string[], fetchId: number) => {
    const results = await Promise.all(oids.map((oid) => getOpintopolkuKoulutus(oid)));
    // If fetchId doesn't match, it means a new fetch has started and we should discard these results
    if (fetchId !== fetchIdRef.current) return [];
    return results
      .map((data, i) =>
        data
          ? {
              oid: oids[i],
              title: getLocalizedOpintopolkuText(data.nimi),
              description: getLocalizedOpintopolkuText(data.metadata?.kuvaus),
              credits: getCredits(data.metadata),
              creditUnit: getLocalizedOpintopolkuText(data.metadata?.opintojenLaajuusyksikko?.nimi),
            }
          : undefined,
      )
      .filter(Boolean) as OpintopolkuKoulutusProps[];
  };

  const fetchMore = React.useCallback(async () => {
    // If we've already fetched all items, do nothing
    if (nextIndexRef.current >= oids.length) return;

    // Increment fetchId to invalidate any ongoing fetches
    const currentFetchId = fetchIdRef.current;
    setLoading(true);

    const fetchCount = PAGE_SIZE + 1;
    const newKoulutukset: OpintopolkuKoulutusProps[] = [];

    while (nextIndexRef.current < oids.length && newKoulutukset.length < fetchCount) {
      const batchSize = Math.min(fetchCount - newKoulutukset.length, PAGE_SIZE);
      const batchOids = oids.slice(nextIndexRef.current, nextIndexRef.current + batchSize);
      nextIndexRef.current += batchOids.length;

      const batchResults = await fetchBatch(batchOids, currentFetchId);
      newKoulutukset.push(...batchResults);

      if (currentFetchId !== fetchIdRef.current) return;
    }

    setFetchedKoulutukset((prev) => [...prev, ...newKoulutukset]);
    setLoading(false);
  }, [oids]);

  const handleShowMore = React.useCallback(() => {
    const newPage = page + 1;
    setPage(newPage);
    // Fetch more if we don't have enough items for the next page + 1 to check hasMore
    const neededCount = PAGE_SIZE * newPage + 1;
    if (fetchedKoulutukset.length < neededCount && nextIndexRef.current < oids.length) {
      fetchMore();
    }
  }, [page, fetchedKoulutukset.length, oids.length, fetchMore]);

  React.useEffect(() => {
    fetchIdRef.current++;
    nextIndexRef.current = 0;
    setFetchedKoulutukset([]);
    setPage(1);
    setLoading(false);
  }, [oids]);

  React.useEffect(() => {
    if (fetchedKoulutukset.length === 0 && oids.length > 0 && !loading) {
      fetchMore();
    }
  }, [fetchedKoulutukset.length, oids.length, loading, fetchMore]);

  return fetchedKoulutukset.length > 0 || loading ? (
    <div className="flex flex-col gap-4 mt-9 pt-7 border-t-2 border-border-gray">
      {displayedKoulutukset.map((koulutus) => (
        <OpintopolkuKoulutus key={koulutus.oid} {...koulutus} />
      ))}
      {loading && (
        <div className="flex justify-center" role="presentation">
          <Spinner size={32} color="accent" />
        </div>
      )}
      {!loading && hasMore && (
        <div className="flex justify-start pl-4">
          <Button label={t('show-more')} variant="plain" onClick={handleShowMore} />
        </div>
      )}
    </div>
  ) : null;
};
