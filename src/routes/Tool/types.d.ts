import { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';

export interface ContextType {
  competences: [OsaaminenValue[], React.Dispatch<React.SetStateAction<OsaaminenValue[]>>];
  interests: [OsaaminenValue[], React.Dispatch<React.SetStateAction<OsaaminenValue[]>>];
}
