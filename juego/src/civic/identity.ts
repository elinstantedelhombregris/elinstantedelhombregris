import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { nuevoId } from '@/db/repos';

const ACTOR_KEY = 'basta.civic.actor-key.v1';
let actorGeneration = 0;
let actorResetInFlight: Promise<void> | null = null;

const getStoredActorKey = (): Promise<string | null> => Platform.OS === 'web'
  ? AsyncStorage.getItem(ACTOR_KEY)
  : SecureStore.getItemAsync(ACTOR_KEY);

const setActorKey = (value: string): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.setItem(ACTOR_KEY, value)
  : SecureStore.setItemAsync(ACTOR_KEY, value);

const deleteActorKey = (): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.removeItem(ACTOR_KEY)
  : SecureStore.deleteItemAsync(ACTOR_KEY);

export const getActorKey = async (): Promise<string> => {
  if (actorResetInFlight) await actorResetInFlight;
  const generation = actorGeneration;
  const current = await getStoredActorKey();
  if (current) {
    if (generation !== actorGeneration) throw new Error('civic_actor_key_reset');
    return current;
  }

  const created = `actor_${nuevoId()}`;
  if (generation !== actorGeneration) throw new Error('civic_actor_key_reset');
  await setActorKey(created);
  if (generation !== actorGeneration) {
    await deleteActorKey();
    throw new Error('civic_actor_key_reset');
  }
  return created;
};

/** Retira la identidad seudónima de esta instalación del almacenamiento local. */
export const resetCivicActorKey = async (): Promise<void> => {
  actorGeneration += 1;
  const reset = deleteActorKey();
  actorResetInFlight = reset;
  try {
    await reset;
  } finally {
    if (actorResetInFlight === reset) actorResetInFlight = null;
  }
};
