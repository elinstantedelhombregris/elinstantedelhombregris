/** three ≥ r163 dibuja solo con WebGL 2. */
export function soportaWebGL2(): boolean {
  try {
    return document.createElement('canvas').getContext('webgl2') !== null;
  } catch {
    return false;
  }
}
