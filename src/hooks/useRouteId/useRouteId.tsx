import { LangCode } from '@/i18n/config';

type FeatureName = 'job-opportunity';
export const useRouteId = (feature: FeatureName, lang: LangCode) => `${feature}-${lang}`;
