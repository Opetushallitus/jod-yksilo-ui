import { useState, useEffect } from 'react';

export const useDebounceState = <T>(initialValue: T, time: number): [T, T, React.Dispatch<T>] => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, time);

    return () => {
      clearTimeout(timer);
    };
  }, [value, time]);

  return [debouncedValue, value, setValue];
};
