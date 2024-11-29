import { components } from '@/api/schema';

export type Mahdollisuus =
  | components['schemas']['TyomahdollisuusDto']
  | components['schemas']['KoulutusmahdollisuusDto'];
export type MahdollisuusTyyppi = 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';
export type TypedMahdollisuus = Mahdollisuus & { mahdollisuusTyyppi: MahdollisuusTyyppi };

export interface Kokemus {
  id?: string;
  uri?: string;
  nimi: Record<string, string | undefined>;
  kuvaus?: Record<string, string | undefined>;
  alkuPvm?: string;
  loppuPvm?: string;
  osaamiset?: string[];
}
