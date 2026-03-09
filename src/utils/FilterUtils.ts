export const getFilterCount = <T>(filters: T, filterList: (keyof T)[]) => {
  if (!filters) {
    return 0;
  }

  return filterList.reduce((sum, filter) => {
    const value = filters[filter];
    if (Array.isArray(value)) {
      return sum + value.length;
    } else if (typeof value === 'number') {
      return sum + value;
    } else {
      return sum;
    }
  }, 0);
};

export const noFiltersSelected = <T>(filters: T) =>
  Object.values(filters ?? {}).every((value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else if (typeof value === 'number') {
      return value === 0;
    } else if (value === null) {
      return true;
    } else {
      return true;
    }
  });
