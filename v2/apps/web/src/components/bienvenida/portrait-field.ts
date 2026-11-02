// A small displacement field, rather than a separate simulation per particle.
// Each texel follows a critically damped spring. Pointer pressure fades quickly;
// position and velocity stay continuous even on fast reversals and pointer exit.
export const PORTRAIT_RESPONSE = Object.freeze({
  columns: 128,
  rows: 192,
  radius: 46,
  omega: 32,
  pressureDecay: 0.075,
  displacement: 40,
  depth: 18,
  spacing: 5,
});

export interface PortraitBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PointerSample {
  x: number;
  y: number;
  time: number;
}
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function createPortraitField() {
  const { columns, rows, omega, pressureDecay, displacement, spacing } = PORTRAIT_RESPONSE;
  const length = columns * rows;
  const pixels = new Uint8Array(length * 4);
  const position = new Float32Array(length * 2);
  const velocity = new Float32Array(length * 2);
  const target = new Float32Array(length * 2);
  const live = new Uint8Array(length);
  let active: number[] = [];
  let previous: PointerSample | null = null,
    lastTime: number | null = null;
  let revision = 0,
    peak = 0,
    maxDisplacement = 0;
  let bounds = { x: 0, y: 0, w: 400, h: 600 };
  const lambda = 1 / pressureDecay;
  const particular = (omega * omega) / ((omega - lambda) * (omega - lambda));

  function reset() {
    position.fill(0);
    velocity.fill(0);
    target.fill(0);
    live.fill(0);
    for (let i = 0; i < length; i++) {
      pixels[i * 4] = 128;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 128;
      pixels[i * 4 + 3] = 0;
    }
    active = [];
    previous = null;
    lastTime = null;
    peak = 0;
    maxDisplacement = 0;
    revision++;
  }
  function resize(nextBounds: PortraitBounds) {
    bounds = { ...nextBounds };
    reset();
  }

  function advance(time: number) {
    if (lastTime === null) {
      lastTime = time;
      return;
    }
    const dt = time - lastTime;
    if (dt < -0.02 || dt > 0.8) {
      reset();
      lastTime = time;
      return;
    }
    if (dt <= 0) return;
    if (!active.length) {
      lastTime = time;
      return;
    }
    lastTime = time;
    const spring = Math.exp(-omega * dt),
      pressure = Math.exp(-lambda * dt);
    const remaining: number[] = [];
    peak = 0;
    maxDisplacement = 0;
    for (const index of active) {
      const offset = index * 2;
      let moving = false;
      for (let axis = 0; axis < 2; axis++) {
        const n = offset + axis;
        // Exact solution for a critical spring following an exponentially
        // decaying target. It gives the same motion at 30, 60 and 120 Hz.
        const a = particular * (target[n] ?? 0);
        const c = (position[n] ?? 0) - a;
        const d = (velocity[n] ?? 0) + omega * c + lambda * a;
        const x = (c + d * dt) * spring + a * pressure;
        const v = (d - omega * (c + d * dt)) * spring - lambda * a * pressure;
        target[n] = (target[n] ?? 0) * pressure;
        position[n] = x;
        velocity[n] = v;
        moving ||= Math.abs(x) > 0.015 || Math.abs(v) > 0.35 || Math.abs(target[n] ?? 0) > 0.015;
      }
      const p = index * 4;
      if (moving) {
        remaining.push(index);
        const x = position[offset] ?? 0,
          y = position[offset + 1] ?? 0;
        const distance = Math.hypot(x, y);
        const strength = clamp(distance / displacement, 0, 1);
        // Two 16-bit signed offsets in one RGBA8 texture. Reconstructing the
        // linear high/low pairs after hardware filtering preserves subpixels.
        const encodedX = Math.round(32768 + clamp(x / displacement, -1, 1) * 32767);
        const encodedY = Math.round(32768 + clamp(y / displacement, -1, 1) * 32767);
        pixels[p] = encodedX >> 8;
        pixels[p + 1] = encodedX & 255;
        pixels[p + 2] = encodedY >> 8;
        pixels[p + 3] = encodedY & 255;
        maxDisplacement = Math.max(maxDisplacement, distance);
        peak = Math.max(peak, strength);
      } else {
        live[index] = 0;
        position.fill(0, offset, offset + 2);
        velocity.fill(0, offset, offset + 2);
        target.fill(0, offset, offset + 2);
        pixels[p] = 128;
        pixels[p + 1] = 0;
        pixels[p + 2] = 128;
        pixels[p + 3] = 0;
      }
    }
    active = remaining;
    revision++;
  }

  function stamp(
    x: number,
    y: number,
    flowX: number,
    flowY: number,
    strength: number,
    radius: number,
  ) {
    const u = (x - bounds.x) / bounds.w,
      v = (y - bounds.y) / bounds.h;
    const rx = radius / bounds.w,
      ry = radius / bounds.h;
    const left = clamp(Math.floor((u - rx) * columns), 0, columns - 1);
    const right = clamp(Math.ceil((u + rx) * columns), 0, columns - 1);
    const top = clamp(Math.floor((v - ry) * rows), 0, rows - 1);
    const bottom = clamp(Math.ceil((v + ry) * rows), 0, rows - 1);
    for (let row = top; row <= bottom; row++)
      for (let column = left; column <= right; column++) {
        const dx = (((column + 0.5) / columns - u) * bounds.w) / radius;
        const dy = (((row + 0.5) / rows - v) * bounds.h) / radius;
        const r2 = dx * dx + dy * dy;
        if (r2 >= 1) continue;
        const weight = (1 - r2) ** 3;
        const index = row * columns + column,
          offset = index * 2;
        if (!live[index]) {
          live[index] = 1;
          active.push(index);
        }
        // A bounded, coherent push follows the stroke. No random particle
        // directions, no accumulating additive brush opacity, no hard edge.
        const blend = weight * 0.72;
        const radial = radius * 3.2;
        const nextX = (dx * radial + flowX * 20) * strength * weight;
        const nextY = (dy * radial + flowY * 20) * strength * weight;
        target[offset] = (target[offset] ?? 0) + (nextX - (target[offset] ?? 0)) * blend;
        target[offset + 1] =
          (target[offset + 1] ?? 0) + (nextY - (target[offset + 1] ?? 0)) * blend;
      }
  }

  function interact(x: number, y: number, time: number, force = 0.65) {
    const u = (x - bounds.x) / bounds.w,
      v = (y - bounds.y) / bounds.h;
    if (u < 0 || u > 1 || v < 0 || v > 0.94) {
      previous = null;
      return false;
    }
    advance(time);
    if (previous && time - previous.time > 0.12) previous = null;
    const dx = previous ? x - previous.x : 0,
      dy = previous ? y - previous.y : 0;
    const distance = Math.hypot(dx, dy);
    const elapsed = previous ? Math.max(1 / 240, time - previous.time) : 1 / 60;
    if (previous && distance < 1.25) return false;
    const speed = clamp(distance / elapsed / 1000, 0, 1);
    const strength = clamp(0.36 + force * 0.36 + speed * 0.3, 0.35, 1);
    const radius = PORTRAIT_RESPONSE.radius * (0.88 + speed * 0.12);
    const flowX = distance ? (dx / distance) * speed : 0,
      flowY = distance ? (dy / distance) * speed : 0;
    const steps = previous ? Math.min(64, Math.max(1, Math.ceil(distance / spacing))) : 1;
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      stamp(
        previous ? previous.x + dx * t : x,
        previous ? previous.y + dy * t : y,
        flowX,
        flowY,
        strength,
        radius,
      );
    }
    previous = { x, y, time };
    return true;
  }

  function sample(x: number, y: number) {
    const column = clamp(Math.round(((x - bounds.x) / bounds.w) * columns - 0.5), 0, columns - 1);
    const row = clamp(Math.round(((y - bounds.y) / bounds.h) * rows - 0.5), 0, rows - 1);
    const n = (row * columns + column) * 2;
    return {
      x: position[n] ?? 0,
      y: position[n + 1] ?? 0,
      vx: velocity[n] ?? 0,
      vy: velocity[n + 1] ?? 0,
    };
  }
  reset();
  return {
    pixels,
    resize,
    interact,
    advance,
    reset,
    end: () => {
      previous = null;
    },
    sample,
    stats: () => ({ activeTouches: active.length, peakTouch: peak, maxDisplacement, revision }),
    get revision() {
      return revision;
    },
    get active() {
      return active.length > 0;
    },
  };
}
