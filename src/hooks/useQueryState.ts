import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A hook to sync state with URL query parameters.
 * Similar to useState, but persists to the URL.
 */
export function useQueryState<T extends string>(
  key: string,
  defaultValue: T
): [T, (newValue: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    return (searchParams.get(key) as T) || defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: T) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newValue === defaultValue) {
            next.delete(key);
          } else {
            next.set(key, newValue);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, key, defaultValue]
  );

  return [value, setValue];
}
