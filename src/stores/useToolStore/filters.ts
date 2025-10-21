import { components } from '@/api/schema';

export function filterByRegion(regions: string[], meta: components['schemas']['EhdotusMetadata']): boolean {
  if (regions.length === 0 || meta.tyyppi !== 'TYOMAHDOLLISUUS') {
    return true;
  }
  return regions.some((r) => meta.maakunnat?.includes(r));
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
