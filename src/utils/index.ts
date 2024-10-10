import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n, { defaultLang } from '@/i18n/config';

export const formatDate = (date: Date) => {
  const month = date.getMonth();
  const fullYear = date.getFullYear();
  return isNaN(month) || isNaN(fullYear) ? '' : `${month + 1}/${fullYear}`;
};

/**
 * Gets the localized text from an object.
 * @param entry Object with localized texts
 * @returns The text in current i18next language
 */
export const getLocalizedText = (
  entry?: components['schemas']['LokalisoituTeksti'] | Record<string, string | undefined>,
) => entry?.[i18n.language] ?? entry?.[defaultLang] ?? '';

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
const getNestedProperty = <T>(obj: T, path: string) => {
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
