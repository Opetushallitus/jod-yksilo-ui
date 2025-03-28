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

export interface Jakauma {
  maara: number;
  tyhjia: number;
  arvot: components['schemas']['ArvoDto'][];
}

export interface Jakaumat {
  kortitJaLuvat: Jakauma;
  tyonJatkuvuus: Jakauma;
  palkanPeruste: Jakauma;
  matkustusvaatimus: Jakauma;
  sijaintiJoustava: Jakauma;
  ajokortti: Jakauma;
  kielitaito: Jakauma;
  koulutusaste: Jakauma;
  rikosrekisteriote: Jakauma;
  maakunta: Jakauma;
  osaaminen: Jakauma;
  tyoaika: Jakauma;
  kunta: Jakauma;
  tyokieli: Jakauma;
  palvelussuhde: Jakauma;
  ammatti: Jakauma;
  maa: Jakauma;
}

export type Codeset = Required<Extract<keyof Jakaumat, 'maa' | 'maakunta' | 'kunta' | 'tyokieli'>>;
