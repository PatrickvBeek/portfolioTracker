type AsyncFunction<T extends unknown[], R> = (...args: T) => Promise<R>;

export function throttle<T extends unknown[], R>(
  fn: AsyncFunction<T, R>,
  minInterval: number
): AsyncFunction<T, R> {
  let lastRequestTime = 0;
  let pendingRequest: Promise<void> | null = null;

  return async function checkedCall(...args: T): Promise<R> {
    while (pendingRequest) {
      await pendingRequest;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    let resolveRequest: () => void;
    pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    try {
      return await fn(...args);
    } finally {
      lastRequestTime = Date.now();
      pendingRequest = null;
      resolveRequest!();
    }
  };
}
