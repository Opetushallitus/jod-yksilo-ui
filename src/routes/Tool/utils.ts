export interface EhdotusData {
  /** Format: uuid */
  mahdollisuusId: string;
  ehdotusMetadata?: EhdotusMetadata;
}

export interface EhdotusMetadata {
  /** Format: double */
  pisteet?: number;
  /** @enum {string} */
  trendi?: 'NOUSEVA' | 'LASKEVA';
  /** Format: int32 */
  tyollisyysNakyma?: number;
}

export type EhdotusRecord = Record<string, EhdotusMetadata>;

export const ehdotusDataToRecord = (array: EhdotusData[]): EhdotusRecord => {
  return array.reduce((acc, item) => {
    acc[item.mahdollisuusId] = item?.ehdotusMetadata ?? {};
    return acc;
  }, {} as EhdotusRecord);
};
