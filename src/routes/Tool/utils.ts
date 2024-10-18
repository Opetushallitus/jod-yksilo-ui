import { components } from '@/api/schema';

export type EhdotusRecord = Record<string, components['schemas']['EhdotusMetadata']>;

export const ehdotusDataToRecord = (array: components['schemas']['EhdotusDto'][]): EhdotusRecord => {
  return array.reduce((acc, item) => {
    if (item.mahdollisuusId) {
      acc[item.mahdollisuusId] = item?.ehdotusMetadata ?? {};
    }
    return acc;
  }, {} as EhdotusRecord);
};
