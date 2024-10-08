import { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';

export interface ContextType {
  isLoggedIn: boolean;
  competences: [OsaaminenValue[], (state: OsaaminenValue[]) => void];
  interests: [OsaaminenValue[], (state: OsaaminenValue[]) => void];
}
