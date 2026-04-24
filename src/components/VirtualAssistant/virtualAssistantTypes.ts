import { type OsaaminenDto } from '@/api/osaamiset';

export type VirtualAssistantVariant = 'competences' | 'interests';

export interface VirtualAssistantMessageRow {
  message: string;
  answer?: string;
  ehdotukset?: OsaaminenDto[];
}
