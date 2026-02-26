import type { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import toast from 'react-hot-toast/headless';

/**
 * Formats a date to a string representation.
 * Types: short: MM/YYYY, medium: DD.MM.YYYY
 * @param date Date object to format
 * @param type short | medium
 * @returns Formatted date string
 */
export const formatDate = (date: Date, type: 'short' | 'medium' = 'short'): string => {
  const month = date.getMonth();
  const fullYear = date.getFullYear();
  const day = date.getDate();

  if (isNaN(month) && isNaN(fullYear)) {
    return '';
  } else if (type === 'short') {
    return `${month + 1}/${fullYear}`;
  } else if (type === 'medium') {
    return `${day}.${month + 1}.${fullYear}`;
  } else {
    return '';
  }
};

/**
 * Gets the localized text from "LokalisoituTeksti" object. Uses current i18next language by default.
 * @param entry Object with localized texts
 * @param lang Language code. Uses current i18next language by default.
 * @param defaultLang
 * @param supportedLanguages
 * @returns The text in current i18next language
 */
export const getLocalizedText = (
  entry?: components['schemas']['LokalisoituTeksti'] | Record<string, string | undefined>,
): string => {
  if (!entry) return '';
  const lang = i18n.language;
  const fallbackLang = i18n.options.fallbackLng as string | string[];
  const supportedLanguages = i18n.options.supportedLngs || [];

  if (entry[lang]?.trim()) {
    return entry[lang].trim();
  }

  if (Array.isArray(fallbackLang)) {
    for (const fbLang of fallbackLang) {
      if (entry[fbLang]?.trim()) return entry[fbLang].trim();
    }
  } else if (entry[fallbackLang]?.trim()) {
    return entry[fallbackLang].trim();
  }

  for (const supportedLang of supportedLanguages) {
    if (supportedLang !== lang && supportedLang !== fallbackLang && entry[supportedLang]?.trim()) {
      return entry[supportedLang].trim();
    }
  }

  return '';
};

export const getTranslation = (
  entry?: components['schemas']['LokalisoituTeksti'],
  lang: string = i18n.language,
): string => {
  return entry?.[lang]?.trim() ?? '';
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export const isDefined = <T>(item: T | undefined): item is T => item !== undefined;

/**
 * Accesses a nested property using dot notation.
 * @param obj The object to access.
 * @param path The dot notation path.
 * @returns The value of the nested property.
 */
export const getNestedProperty = <T>(obj: T, path: string) => {
  return path.split('.').reduce((acc, part) => (acc as never)?.[part], obj);
};

/**
 * Removes duplicates from an array based on a key selector function.
 * @param arr The array to deduplicate
 * @param keySelector Function to select the key for each item
 * @returns Array with duplicates removed
 */
export const removeDuplicatesByKey = <T, K>(arr: T[], keySelector: (item: T) => K): T[] => {
  const seen = new Map<K, T>();
  for (const item of arr) {
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
};

/**
 * Sorts an array of objects by a specified punction separated property path
 * current implementation support comparison for string, numer and Date properties
 * @param property The property name to sort by.
 * @param reverse Whether to sort in reverse order.
 * @returns A sorting function for use with Array.sort().
 *
 * @example
 *
 * const fruits = [
 *       { fruit: { name: 'banana', count: 30 } },
 *       { fruit: { name: 'apple', count: 50 } },
 *       { fruit: { name: 'cherry', count: 100 } },
 *     ];
 * const sortedFruits = [...fruits].sort(sortByNestedProperty('fruit.count', true));
 *
 * // returns: sortedFruits as
 *  [
 *    { fruit: { name: 'cherry', count: 100 } },
 *    { fruit: { name: 'apple', count: 50 } },
 *    { fruit: { name: 'banana', count: 30 } },
 *  ]
 */
export const sortByProperty =
  <T extends object>(property: NestedKeyOf<T>, reverse = false) =>
  (a: T, b: T) => {
    const aValue = getNestedProperty(a, property) as string | number | Date | object;
    const bValue = getNestedProperty(b, property) as string | number | Date | object;

    const values = reverse ? [bValue, aValue] : [aValue, bValue];
    const isNumberType = values.every((p) => typeof p === 'number');
    const isDateType = values.every((p) => p instanceof Date);

    if (typeof values[0] === 'string' && typeof values[1] === 'string') {
      return values[0].localeCompare(values[1], i18n.language);
    } else if (isNumberType || isDateType) {
      if (values[0] < values[1]) {
        return -1;
      }
      if (values[0] > values[1]) {
        return 1;
      }
      return 0;
    } else {
      return 0;
    }
  };

/**
 * Takes an array and returns a new array with a subset of items based on the page number and page size.
 * @param array Items to be paginated
 * @param pageNumber Desired page number. Starts from 1.
 * @param pageSize Items per page
 * @returns Sliced array based on the page number and page size
 */
export const paginate = <T>(array: T[], pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const safePageNumber = Math.max(pageNumber, 1);
  return array.slice((safePageNumber - 1) * pageSize, safePageNumber * pageSize);
};

export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/** Copies the given text to clipboard and shows a toast.
  Clipboard is not working on local dev-environment on iOS Safari, because it is not secure context (https://).
*/
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(i18n.t('link-copied'));
  } catch (_e) {
    toast.error(i18n.t('link-copy-failed'));
  }
};

export const parseBoolean = (value: unknown) => {
  if (typeof value === 'boolean' && value === true) {
    return true;
  } else if (['true', '1', 1].includes(String(value).toLowerCase())) {
    return true;
  } else {
    return false;
  }
};

export const stringToLocalizedText = (
  item?: string,
  lang: string = i18n.language,
): components['schemas']['LokalisoituTeksti'] => {
  if (!item) {
    return { fi: '', sv: '', en: '' };
  }
  const localizedText: components['schemas']['LokalisoituTeksti'] = { fi: '', sv: '', en: '' };
  if (lang === 'fi' || lang === 'sv' || lang === 'en') {
    localizedText[lang] = item;
  } else {
    localizedText.fi = item;
  }

  return localizedText;
};

export const hasLocalizedText = (item?: components['schemas']['LokalisoituTeksti']): boolean => {
  if (!item) {
    return false;
  }

  return Object.values(item).some((text) => text?.trim().length > 0);
};

/**
 * Converts spaces to hyphens and lowercases the string. Good for generating IDs.
 * Example: "My Section Title" -> "my-section-title"
 * @param str The input string
 * @returns The hyphenized string
 */
// SonarQube: Using replace here is intentional to collapse all whitespace into a single hyphen.
// sonarjs/no-replace-all
export const hyphenize = (str: string) => str.trim().replace(/\s+/g, '-').toLowerCase();

/**
 * Normalizes multiline text by collapsing multiple consecutive newlines into a maximum of two.
 * @param text The input text
 * @returns The normalized text
 */
export const normalizeMultilineText = (text = '') => text.replace(/\n{3,}/g, '\n\n');
