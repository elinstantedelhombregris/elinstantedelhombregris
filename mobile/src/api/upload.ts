import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Subida directa de fotos a Cloudinary (unsigned preset) — cero paso por
 * Vercel. La app comprime primero (≤1600px, calidad 0.7) y manda la
 * secure_url resultante como photoUrl. El backend solo acepta
 * https://res.cloudinary.com/... (server/lib/campanas.ts).
 */

const CLOUD = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD;
const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET;

/** ¿Están las credenciales? Sin ellas, la UI muestra "Fotos disponibles pronto". */
export const cloudinaryConfigured = Boolean(CLOUD && PRESET);

const MAX_DIMENSION = 1600;

async function compress(uri: string): Promise<string> {
  try {
    const image = await ImageManipulator.manipulate(uri)
      .resize({ width: MAX_DIMENSION })
      .renderAsync();
    const saved = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
    return saved.uri;
  } catch {
    // Si la compresión falla, probamos subir la original.
    return uri;
  }
}

/**
 * Comprime y sube una foto local. Devuelve la secure_url de Cloudinary,
 * o null si no hay credenciales o la subida falló (la entrada sale sin foto).
 */
export async function uploadToCloudinary(localUri: string): Promise<string | null> {
  if (!cloudinaryConfigured) return null;

  const uri = await compress(localUri);

  const form = new FormData();
  // React Native acepta este shape de archivo en FormData
  form.append('file', {
    uri,
    name: 'entrada.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  form.append('upload_preset', PRESET as string);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { secure_url?: string };
    return data.secure_url ?? null;
  } catch {
    return null;
  }
}
