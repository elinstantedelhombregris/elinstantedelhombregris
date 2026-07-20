/**
 * Fetch con corte de tiempo compartido por toda la capa cívica. Un host que
 * acepta la conexión pero nunca responde no puede colgar el login, el
 * enrolamiento del dispositivo ni la sincronización.
 */
export const FETCH_TIMEOUT_MS = 15_000;

export const fetchWithTimeout = async (input: string, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};
