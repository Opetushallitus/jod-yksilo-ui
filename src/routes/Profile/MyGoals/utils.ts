import { components } from '@/api/schema';

export const mapOsaaminenToUri = (osaaminen: components['schemas']['OsaaminenDto']) => osaaminen.uri;
