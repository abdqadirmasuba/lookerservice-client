/**
 * Module-level network event emitter.
 * Allows axios interceptors (outside React) to signal network connectivity issues
 * to the NetworkProvider context inside the component tree.
 */

type NetworkErrorListener = () => void;

let networkErrorListener: NetworkErrorListener | null = null;

export const networkEvents = {
  /** Register the listener (called once by NetworkProvider on mount). */
  setNetworkErrorListener: (fn: NetworkErrorListener | null) => {
    networkErrorListener = fn;
  },

  /** Signal a network failure (called by axios interceptors). */
  emitNetworkError: () => {
    networkErrorListener?.();
  },
};
