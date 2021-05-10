import { useEffect, useRef } from 'preact/hooks';

export function useInterval(callback, delay, options = {}) {
  const savedCallback = useRef();

  if (options.immediate) {
    useEffect(() => {
      callback();
    }, []);
  }

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
