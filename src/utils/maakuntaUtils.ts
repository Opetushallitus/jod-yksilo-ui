import { LangCode } from '@/i18n/config.ts';
import { getCodesetValue } from '@/utils/codes/codes.ts';

export const maakuntaKoodit: [string, string][] = [
  ['01', 'Uusimaa'],
  ['02', 'Varsinais-Suomi'],
  ['04', 'Satakunta'],
  ['05', 'Kanta-Häme'],
  ['06', 'Pirkanmaa'],
  ['07', 'Päijät-Häme'],
  ['08', 'Kymenlaakso'],
  ['09', 'Etelä-Karjala'],
  ['10', 'Etelä-Savo'],
  ['11', 'Pohjois-Savo'],
  ['12', 'Pohjois-Karjala'],
  ['13', 'Keski-Suomi'],
  ['14', 'Etelä-Pohjanmaa'],
  ['15', 'Pohjanmaa'],
  ['16', 'Keski-Pohjanmaa'],
  ['17', 'Pohjois-Pohjanmaa'],
  ['18', 'Kainuu'],
  ['19', 'Lappi'],
  ['21', 'Ahvenanmaa'],
];

export const translateMaakunta = async (
  [code, defaultName]: [string, string],
  lang: LangCode,
): Promise<[string, string]> => {
  const name = await getCodesetValue('maakunta', code, lang).catch(() => defaultName);
  return name === code ? [code, defaultName] : [code, name];
};
