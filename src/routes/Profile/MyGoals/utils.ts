import { components } from '@/api/schema';
import { usePaamaaratStore } from '@/stores/usePaamaaratStore';

export type PaamaaraTyyppi = components['schemas']['PaamaaraDto']['tyyppi'];

/**
 * Checks if the opportunity is a goal and determine the goal type
 * @param mahdollisuusId The opportunity id
 * @returns The goal type of the opportunity
 */
export const getPaamaaraTypeForMahdollisuus = (mahdollisuusId: string): PaamaaraTyyppi | undefined => {
  const { paamaarat } = usePaamaaratStore.getState();
  const pitkanAikavalinTavoite = paamaarat.filter((p) => p.tyyppi === 'PITKA');
  const lyhyenAikavalinTavoite = paamaarat.filter((p) => p.tyyppi === 'LYHYT');
  const muutTavoitteet = paamaarat.filter((p) => p.tyyppi === 'MUU');

  if (pitkanAikavalinTavoite.find((tavoite) => tavoite.mahdollisuusId === mahdollisuusId)) {
    return 'PITKA';
  } else if (lyhyenAikavalinTavoite.find((tavoite) => tavoite.mahdollisuusId === mahdollisuusId)) {
    return 'LYHYT';
  } else if (muutTavoitteet.find((tavoite) => tavoite.mahdollisuusId === mahdollisuusId)) {
    return 'MUU';
  } else {
    return undefined;
  }
};
