import React from 'react';

export const useDebounceState = <T>(initialValue: T, time: number): [T, T, React.Dispatch<T>] => {
  const [value, setValue] = React.useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, time);

    return () => {
      clearTimeout(timer);
    };
  }, [value, time]);

  return [debouncedValue, value, setValue];
};
