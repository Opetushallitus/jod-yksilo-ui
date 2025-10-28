import { components } from '@/api/schema';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';

export type TavoiteTyyppi = components['schemas']['TavoiteDto']['tyyppi'];

/**
 * Checks if the opportunity is a goal and determine the goal type
 * @param mahdollisuusId The opportunity id
 * @returns The goal type of the opportunity
 */
export const getTavoiteTypeForMahdollisuus = (mahdollisuusId: string): TavoiteTyyppi | undefined => {
  const { tavoitteet } = useTavoitteetStore.getState();
  const pitkanAikavalinTavoite = tavoitteet.filter((p) => p.tyyppi === 'PITKA');
  const lyhyenAikavalinTavoite = tavoitteet.filter((p) => p.tyyppi === 'LYHYT');
  const muutTavoitteet = tavoitteet.filter((p) => p.tyyppi === 'MUU');

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
