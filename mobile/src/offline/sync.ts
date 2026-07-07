import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { flushQueue } from './queue';

/**
 * Sincronización pasiva: al volver la red o al traer la app al frente,
 * la cola intenta salir. Montar una sola vez en el layout raíz.
 */
export function useOfflineSync(): void {
  useEffect(() => {
    flushQueue();

    const unsubNet = NetInfo.addEventListener((state) => {
      if (state.isConnected) flushQueue();
    });
    const unsubApp = AppState.addEventListener('change', (status) => {
      if (status === 'active') flushQueue();
    });

    return () => {
      unsubNet();
      unsubApp.remove();
    };
  }, []);
}
