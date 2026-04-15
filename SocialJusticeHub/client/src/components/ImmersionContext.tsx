import React, { createContext, useContext, useState, useMemo } from 'react';

interface ImmersionContextType {
  isImmersive: boolean;
  setImmersive: (value: boolean) => void;
}

const ImmersionContext = createContext<ImmersionContextType>({
  isImmersive: false,
  setImmersive: () => {},
});

export function useImmersion(): ImmersionContextType {
  return useContext(ImmersionContext);
}

export function ImmersionProvider({ children }: { children: React.ReactNode }) {
  const [isImmersive, setImmersive] = useState(false);

  const value = useMemo(
    () => ({ isImmersive, setImmersive }),
    [isImmersive]
  );

  return (
    <ImmersionContext.Provider value={value}>
      {children}
    </ImmersionContext.Provider>
  );
}
