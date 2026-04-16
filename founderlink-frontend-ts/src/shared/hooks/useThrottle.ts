import { useCallback, useRef } from 'react';

const useThrottle = <T extends unknown[]>(
  fn: (..._args: T) => void,
  delay: number = 500
): ((..._args: T) => void) => {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: T) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        fn(...args);
      }
    },
    [fn, delay]
  );
};

export default useThrottle;
