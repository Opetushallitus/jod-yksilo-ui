import { components } from '@/api/schema';
import i18n from '@/i18n/config';

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
export const getLocalizedText = (entry: components['schemas']['LokalisoituTeksti']) => entry[i18n.language] ?? '';

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
 * Sorts an array of objects by a specified property.
 * @param property The property name to sort by.
 * @param reverse Whether to sort in reverse order.
 * @returns A sorting function for use with Array.sort().
 */
export const sortByProperty =
  <T, K extends keyof T>(property: K, reverse = false) =>
  (a: T, b: T) => {
    const values = reverse ? [b[property], a[property]] : [a[property], b[property]];
    const isStringType = values.every((p) => typeof p === 'string');
    const isNumberType = values.every((p) => typeof p === 'number');
    const isDateType = values.every((p) => p instanceof Date);

    if (isStringType) {
      return (values[0] as string).localeCompare(values[1] as string, i18n.language);
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
