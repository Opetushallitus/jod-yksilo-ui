import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import { Datepicker } from '@jod/design-system';
import { ComponentProps } from 'react';
import toast from 'react-hot-toast/headless';

export const formatDate = (date: Date, type: 'short' | 'medium' = 'short') => {
  const month = date.getMonth();
  const fullYear = date.getFullYear();
  const day = date.getDate();

  if (isNaN(month) && isNaN(fullYear)) {
    return '';
  } else {
    if (type === 'short') {
      return `${month + 1}/${fullYear}`;
    }
    if (type === 'medium') {
      return `${day}.${month + 1}.${fullYear}`;
    }
  }
};

/**
 * Gets the localized text from "LokalisoituTeksti" object. Uses current i18next language by default.
 * @param entry Object with localized texts
 * @param lang Language code. Uses current i18next language by default.
 * @returns The text in current i18next language
 */
export const getLocalizedText = (
  entry?: components['schemas']['LokalisoituTeksti'] | Record<string, string | undefined>,
  lang = i18n.language,
) =>
  entry?.[lang] ??
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  entry?.[i18n.options.fallbackLng] ??
  '';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

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
 * Removes duplicates from an array of objects based on a specified key.
 * Supports dot notation for nested properties.
 * @param array The array of objects.
 * @param key The key to check for duplicates, supports dot notation.
 * @returns A new array with duplicates removed.
 */
export const removeDuplicates = <T extends object>(array: T[], key: NestedKeyOf<T>) =>
  array.filter(
    (item, index, self) => index === self.findIndex((t) => getNestedProperty(t, key) === getNestedProperty(item, key)),
  );

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

export interface DatePickerTranslations {
  day: {
    next: string;
    view: string;
    prev: string;
  };
  month: {
    next: string;
    view: string;
    prev: string;
  };
  year: {
    next: string;
    view: string;
    prev: string;
  };
  actions: {
    select: string;
    open: string;
    close: string;
  };
}
export const getDatePickerTranslations = (
  translations: DatePickerTranslations,
): ComponentProps<typeof Datepicker>['translations'] => ({
  nextTrigger: (view) => translations[view].next,
  viewTrigger: (view) => translations[view].view,
  prevTrigger: (view) => translations[view].prev,
  dayCell: (state): string => `${translations.actions.select} ${state.formattedDate}`,
  trigger: (open): string => (open ? translations.actions.close : translations.actions.open),
});

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
