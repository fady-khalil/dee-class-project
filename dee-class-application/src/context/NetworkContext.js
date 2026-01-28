import React, { createContext, useState, useContext, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

const NetworkContext = createContext({
  isConnected: true,
  isReconnecting: false,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasConnected = isConnected;
      const nowConnected = state.isConnected;

      setIsConnected(nowConnected);

      // If we're going from offline to potentially online, show "reconnecting" state
      if (!wasConnected && nowConnected) {
        setIsReconnecting(true);
        // After a delay, hide the reconnecting message
        setTimeout(() => {
          setIsReconnecting(false);
        }, 2000);
      }
    });

    // Check connection immediately
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  return (
    <NetworkContext.Provider value={{ isConnected, isReconnecting }}>
      {children}
    </NetworkContext.Provider>
  );
};
