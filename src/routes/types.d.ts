import { components } from '@/api/schema';

export type Mahdollisuus =
  | components['schemas']['TyomahdollisuusDto']
  | components['schemas']['KoulutusmahdollisuusDto'];
export type MahdollisuusTyyppi = 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';
export type TypedMahdollisuus = Mahdollisuus & { mahdollisuusTyyppi: MahdollisuusTyyppi };
