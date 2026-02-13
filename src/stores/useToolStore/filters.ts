import { components } from '@/api/schema';
import { maxKestoValue } from '@/routes/Tool/components/filters/FilterKesto.tsx';
import { getToimiala } from '@/utils/codes/codes.ts';

export function filterByRegion(regions: string[], meta: components['schemas']['EhdotusMetadata']): boolean {
  if (regions.length === 0) {
    return true;
  }
  return regions.some((r) => meta.maakunnat?.includes(r));
}

export function filterByKesto(
  minDuration: number | null,
  maxDuration: number | null,
  meta: components['schemas']['EhdotusMetadata'],
): boolean {
  if (meta.tyyppi !== 'KOULUTUSMAHDOLLISUUS') {
    return true;
  }
  const effectiveMin = minDuration ?? 0;
  const effectiveMax = maxDuration ?? maxKestoValue;

  // if all durations are included, we also want to include koulutusmahdollisuudet with undefined duration
  if (effectiveMin === 0 && effectiveMax === maxKestoValue) {
    return true;
  }
  if (effectiveMin === maxKestoValue) {
    const sixYears = 6 * 12;
    return (meta.kesto ?? 0) >= sixYears;
  }
  if (meta.kesto == null) {
    return false;
  }
  return (
    ((meta.kestoMaksimi && meta.kestoMaksimi >= effectiveMin) || meta.kesto >= effectiveMin) &&
    ((meta.kestoMinimi && meta.kestoMinimi <= effectiveMax) || meta.kesto <= effectiveMax)
  );
}

export function filterByEducationType(
  educationOpportunityType: string[],
  meta: components['schemas']['EhdotusMetadata'],
): boolean {
  if (educationOpportunityType.length === 0 || meta.tyyppi !== 'KOULUTUSMAHDOLLISUUS') {
    return true;
  }
  const shouldShowTutkinnot = educationOpportunityType.includes('TUTKINTO');
  const isTutkinto = meta.koulutusmahdollisuusTyyppi === 'TUTKINTO';
  const shouldShowMuut = educationOpportunityType.includes('EI_TUTKINTO');
  const isMuu = meta.koulutusmahdollisuusTyyppi === 'EI_TUTKINTO';
  return (shouldShowTutkinnot && isTutkinto) || (shouldShowMuut && isMuu);
}

export function filterByJobType(jobOpportunityType: string[], meta: components['schemas']['EhdotusMetadata']): boolean {
  if (jobOpportunityType.length === 0 || meta.tyyppi !== 'TYOMAHDOLLISUUS') {
    return true;
  }
  const shouldShowAmmatit = jobOpportunityType.includes('AMMATTITIETO');
  const isAmmatti = meta.aineisto === 'AMMATTITIETO';
  const shouldShowMuut = jobOpportunityType.includes('TMT');
  const isMuuMahdollisuus = meta.aineisto === 'TMT';
  return (shouldShowAmmatit && isAmmatti) || (shouldShowMuut && isMuuMahdollisuus);
}

export function filterByAmmattiryhmat(
  ammattiryhmat: string[],
  meta: components['schemas']['EhdotusMetadata'],
): boolean {
  if (ammattiryhmat.length == 0 || meta.tyyppi != 'TYOMAHDOLLISUUS') {
    return true;
  }
  // Ammattiryhmat are in form C1, and meta.ammattiryhma is in format C1234
  // If meta.ammattiryhma starts with category code, it belongs to that category
  return ammattiryhmat.some((ar) => meta.ammattiryhma?.startsWith(ar));
}

export function filterByToimialat(toimialaFilters: string[], meta: components['schemas']['EhdotusMetadata']): boolean {
  if (toimialaFilters.length === 0 || meta.tyyppi !== 'TYOMAHDOLLISUUS') {
    return true;
  }
  if (!meta.toimialat) {
    return false;
  }

  const filterSet = new Set(toimialaFilters);
  const uniqueUpperLevels = new Set(meta.toimialat.map((ta) => ta.substring(0, 2)));
  for (const upperLevel of uniqueUpperLevels) {
    const toimiala = getToimiala(upperLevel);
    if (toimiala?.parentCode && filterSet.has(toimiala.parentCode)) {
      return true;
    }
  }
  return false;
}
