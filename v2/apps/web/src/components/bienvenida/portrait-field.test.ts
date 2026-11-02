import assert from 'node:assert/strict';

import { test } from 'vitest';

import { createPortraitField, PORTRAIT_RESPONSE } from './portrait-field';

const make = () => {
  const field = createPortraitField();
  field.resize({ x: 0, y: 0, w: 400, h: 600 });
  return field;
};

test('a gesture has continuous position and velocity on contact and reversal', () => {
  const field = make();
  field.interact(180, 180, 0);
  field.advance(0.05);
  const before = field.sample(190, 180);
  field.interact(210, 180, 0.05);
  assert.deepEqual(field.sample(190, 180), before);
  field.advance(0.1);
  const reversal = field.sample(190, 180);
  field.interact(170, 180, 0.1);
  assert.deepEqual(field.sample(190, 180), reversal);
  assert.ok(Math.hypot(reversal.x, reversal.y) > 0.5);
});

test('the same input settles equally at 30, 60 and 120 render frames per second', () => {
  const events = Array.from({ length: 19 }, (_, i) => ({ time: i / 60, x: 140 + (i / 60) * 400 }));
  function play(hz: number) {
    const field = make();
    let input = 0;
    for (let frame = 0; frame <= hz * 0.6; frame++) {
      const time = frame / hz;
      while (input < events.length) {
        const e = events[input];
        if (!e || e.time > time + 1e-8) break;
        input++;
        field.interact(e.x, 180, e.time);
      }
      field.advance(time);
    }
    return field.sample(260, 180);
  }
  const reference = play(120);
  for (const hz of [30, 60]) {
    const actual = play(hz);
    for (const key of ['x', 'y', 'vx', 'vy'] as const)
      assert.ok(Math.abs(actual[key] - reference[key]) < 0.0001, `${hz} Hz ${key}`);
  }
});

test('a swept stroke is visible, bounded and recovers within half a second', () => {
  const field = make();
  let peak = 0;
  for (let i = 0; i <= 18; i++) {
    const time = i / 60;
    field.interact(140 + time * 400, 180, time);
    field.advance(time);
    peak = Math.max(peak, field.stats().maxDisplacement);
  }
  assert.ok(peak > 8 && peak < 24, `stroke displacement ${peak}`);
  field.advance(0.7);
  assert.ok(field.stats().maxDisplacement < peak * 0.05, '95% recovered by 400 ms after release');
  field.advance(0.8);
  assert.ok(field.stats().maxDisplacement < 0.15, 'visually at rest after 500 ms');
  field.advance(1.1);
  assert.equal(field.stats().activeTouches, 0);
  for (let i = 0; i < field.pixels.length; i += 4)
    assert.deepEqual([...field.pixels.slice(i, i + 4)], [128, 0, 128, 0]);
});

test('pointer exit cannot connect two distant strokes through the face', () => {
  const field = make();
  field.interact(100, 180, 0);
  field.end();
  field.interact(300, 180, 0.01);
  field.advance(0.08);
  assert.deepEqual(field.sample(200, 180), { x: 0, y: 0, vx: 0, vy: 0 });
  assert.equal(field.interact(-40, 180, 0.09), false);
});

test('texture packing preserves motion below one pixel and reset is clean', () => {
  const field = make();
  field.interact(200, 180, 0);
  field.advance(0.005);
  const point = field.sample(210, 180);
  const column = Math.round((210 / 400) * PORTRAIT_RESPONSE.columns - 0.5),
    row = Math.round((180 / 600) * PORTRAIT_RESPONSE.rows - 0.5);
  const offset = (row * PORTRAIT_RESPONSE.columns + column) * 4;
  const encoded = (field.pixels[offset] ?? 0) * 256 + (field.pixels[offset + 1] ?? 0);
  const decoded = ((encoded - 32768) / 32767) * PORTRAIT_RESPONSE.displacement;
  assert.ok(Math.abs(decoded - point.x) < 0.001);
  field.reset();
  assert.equal(field.stats().activeTouches, 0);
  assert.deepEqual(field.sample(210, 180), { x: 0, y: 0, vx: 0, vy: 0 });
});
