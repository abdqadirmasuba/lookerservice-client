import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import * as Network from 'expo-network';
import { networkEvents } from '../utils/networkEvents';

interface NetworkContextValue {
  isOffline: boolean;
  retryConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOffline: false,
  retryConnection: async () => {},
});

export const useNetworkContext = () => useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const state = await Network.getNetworkStateAsync();
      return !!(state.isConnected && state.isInternetReachable !== false);
    } catch {
      return false;
    }
  }, []);

  // Register the listener so axios interceptors can trigger the offline state
  useEffect(() => {
    networkEvents.setNetworkErrorListener(() => setIsOffline(true));
    return () => networkEvents.setNetworkErrorListener(null);
  }, []);

  // When offline, poll every 5 s and auto-recover when connectivity is back
  useEffect(() => {
    if (!isOffline) return;

    pollRef.current = setInterval(async () => {
      const online = await checkConnectivity();
      if (online) {
        setIsOffline(false);
      }
    }, 5000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOffline, checkConnectivity]);

  // Manual retry from the refresh button
  const retryConnection = useCallback(async () => {
    const online = await checkConnectivity();
    if (online) {
      setIsOffline(false);
    }
  }, [checkConnectivity]);

  return (
    <NetworkContext.Provider value={{ isOffline, retryConnection }}>
      {children}
    </NetworkContext.Provider>
  );
}
