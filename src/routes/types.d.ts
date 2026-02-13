import { components } from '@/api/schema';

export type Mahdollisuus =
  | components['schemas']['TyomahdollisuusDto']
  | components['schemas']['KoulutusmahdollisuusDto'];
export type MahdollisuusTyyppi = 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';
export type TypedMahdollisuus = Mahdollisuus & {
  aineisto?: components['schemas']['TyomahdollisuusDto']['aineisto'];
  tyyppi?: components['schemas']['KoulutusmahdollisuusDto']['tyyppi'];
  kesto?: components['schemas']['KoulutusmahdollisuusDto']['kesto'];
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  osaamisetCount?: number;
  ammattiryhma?: components['schemas']['AmmattiryhmaBasicDto'];
  yleisinKoulutusala?: string;
};
export type OsaaminenLahdeTyyppi = components['schemas']['OsaamisenLahdeDto']['tyyppi'] | 'KIINNOSTUS' | 'KARTOITETTU';

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

export interface TyomahdollisuusJakaumat {
  ajokortti: Jakauma;
  ammatti: Jakauma;
  kielitaito: Jakauma;
  kortitJaLuvat: Jakauma;
  koulutusaste: Jakauma;
  kunta: Jakauma;
  maa: Jakauma;
  maakunta: Jakauma;
  matkustusvaatimus: Jakauma;
  osaaminen: Jakauma;
  palkanPeruste: Jakauma;
  palvelussuhde: Jakauma;
  rikosrekisteriote: Jakauma;
  sijaintiJoustava: Jakauma;
  tyoaika: Jakauma;
  tyokieli: Jakauma;
  tyonJatkuvuus: Jakauma;
  toimiala: Jakauma;
}

export interface KoulutusmahdollisuusJakaumat {
  aika?: Jakauma;
  koulutusala?: Jakauma;
  kunta?: Jakauma;
  maakunta?: Jakauma;
  maksullisuus?: Jakauma;
  opetustapa?: Jakauma;
  osaaminen?: Jakauma;
}
interface CodeSetValue {
  code: string;
  value: string;
}
export type JakaumaKey = keyof KoulutusmahdollisuusJakaumat | keyof TyomahdollisuusJakaumat;

export interface JakaumaDisplayValueTranslations {
  maksullisuus: Record<'lukuvuosimaksu' | 'maksullinen' | 'maksuton', string>;
  palkanPeruste: Record<
    'OTHER' | 'PIECE_WORK' | 'PROVISION' | 'SALARY' | 'SALARY_PROVISION' | 'TIME_RATE' | 'TIME_RATE_PROVISION',
    string
  >;
  palvelussuhde: Record<'COMMISSION' | 'EMPLOYMENT' | 'ENTREPRENEURSHIP' | 'SERVICE_IN_PUBLIC_ADMINISTRATION', string>;
  tyoaika: Record<'FULLTIME' | 'PARTTIME', string>;
  tyonJatkuvuus: Record<'PERMANENT' | 'TEMPORARY', string>;
}
