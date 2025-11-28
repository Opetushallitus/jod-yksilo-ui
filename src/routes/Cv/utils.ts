import type { OsaaminenDto } from '@/api/osaamiset';

export type OsaaminenMapType = Record<
  string,
  {
    id: string;
    nimi: Record<string, string>;
    kuvaus: Record<string, string>;
  }
>;

// Utility functions to use with osaamiset.combine
export const osaaminenCombiner = (_: string, o: OsaaminenDto) => ({
  id: o.uri,
  nimi: o.nimi,
  kuvaus: o.kuvaus,
});

// Convert array of objects with 'id' to a map
export const arrayToIdMap = <T extends { id: string }>(arr: T[]): Record<string, T> => {
  return arr.reduce<Record<string, T>>((acc, obj) => {
    acc[obj.id] = obj;
    return acc;
  }, {});
};
